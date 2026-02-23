// @ts-nocheck
import { createClient } from 'supabase'
import { GoogleGenerativeAI } from "ai"
import { encodeBase64 } from "@std/encoding/base64"

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
};

const ALLOWED_JURISDICTIONS = new Set(["India", "USA", "Canada", "UK", "Australia", "UAE", "General"]);

function jsonResponse(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function normalizeJurisdiction(raw: any): string {
  const j = String(raw ?? "").trim();
  if (ALLOWED_JURISDICTIONS.has(j)) return j;

  // Gentle normalization for common model outputs like "Ontario, Canada"
  const jl = j.toLowerCase();
  if (jl.includes("canada")) return "Canada";
  if (jl.includes("usa") || jl.includes("united states") || jl.includes("u.s.")) return "USA";
  if (jl.includes("uk") || jl.includes("united kingdom") || jl.includes("england")) return "UK";
  if (jl.includes("australia")) return "Australia";
  if (jl.includes("uae") || jl.includes("emirates")) return "UAE";
  if (jl.includes("india")) return "India";

  return "General";
}

function extractFirstJsonObject(text: string) {
  const m = text?.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("MODEL_JSON_PARSE_FAILED");
  return JSON.parse(m[0]);
}

async function pickPromptRegistry(typeKey: string, jurisdiction: string, orgId: string | null) {
  // Waterfall priority:
  // 1) org + exact jurisdiction
  // 2) org + General
  // 3) global(null org) + exact jurisdiction
  // 4) global(null org) + General

  // IMPORTANT FIX:
  // If orgId is null, DO NOT query org_id = '0000...' (unless you physically store that value in prompt_registry).
  // Your global rows are org_id NULL, so we must skip org queries when orgId is missing.
  if (orgId) {
    let q = await supabase.from('prompt_registry')
      .select('id, prompt_text, slug, jurisdiction, org_id')
      .eq('type_key', typeKey)
      .eq('org_id', orgId)
      .eq('jurisdiction', jurisdiction)
      .maybeSingle();

    if (q.data) return q.data;

    q = await supabase.from('prompt_registry')
      .select('id, prompt_text, slug, jurisdiction, org_id')
      .eq('type_key', typeKey)
      .eq('org_id', orgId)
      .eq('jurisdiction', 'General')
      .maybeSingle();

    if (q.data) return q.data;
  }

  let q = await supabase.from('prompt_registry')
    .select('id, prompt_text, slug, jurisdiction, org_id')
    .eq('type_key', typeKey)
    .is('org_id', null)
    .eq('jurisdiction', jurisdiction)
    .maybeSingle();

  if (q.data) return q.data;

  q = await supabase.from('prompt_registry')
    .select('id, prompt_text, slug, jurisdiction, org_id')
    .eq('type_key', typeKey)
    .is('org_id', null)
    .eq('jurisdiction', 'General')
    .maybeSingle();

  if (q.data) return q.data;

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');

  if (!authHeader) {
    return jsonResponse({
      error: "NO_AUTH_HEADER",
      details: "The frontend did not send a Bearer token."
    }, 401);
  }

  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({
      error: "INVALID_AUTH_HEADER",
      details: "Authorization header must be: Bearer <access_token>"
    }, 401);
  }

  let recordId: string | null = null;

  try {
    const token = authHeader.slice("Bearer ".length).trim();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({
        error: "INVALID_TOKEN",
        details: authError?.message ?? "No user"
      }, 401);
    }

    const userId = user.id;

    const body = await req.json();
    recordId = body.record?.id || body.id;

    const targetLanguage = body.language || "English";
    const translation_only = body.translation_only || false;

    if (!recordId) {
      return jsonResponse({ error: "MISSING_RECORD_ID" }, 400);
    }

    // --- FETCH CONTEXTUAL ORG ID ---
    // FIX: maybeSingle prevents crash when no membership row exists
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', userId)
      .maybeSingle();

    const orgId = membership?.organization_id ?? null;

    // --- BRANCH A: STEP 3 (BILINGUAL TRANSLATION) ---
    if (translation_only) {
      const { data: audit, error: auditErr } = await supabase
        .from('audits')
        .select('*')
        .eq('id', recordId)
        .single();

      if (auditErr || !audit) {
        return jsonResponse({
          error: "AUDIT_NOT_FOUND",
          details: auditErr?.message ?? "No audit row"
        }, 404);
      }

      const translator = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const transPrompt = `Translate the following analysis to ${targetLanguage}. 
CRITICAL: The 'quote' fields and 'page_ref' are the legal Source of Truth. 
You MUST keep them in their original language (${audit.detected_language}) exactly as they are.

DATA: { 
  "v": "${audit.verdict}", 
  "f": ${JSON.stringify(audit.meta_data?.all_flags)}, 
  "d": ${JSON.stringify(audit.meta_data?.all_dates)},
  "m": ${JSON.stringify(audit.missing_clauses)} 
}`;

      const result = await translator.generateContent(transPrompt);
      const cleanJson = extractFirstJsonObject(result.response.text());

      await supabase.from('audits').update({
        translations: { ...(audit.translations || {}), [targetLanguage]: cleanJson }
      }).eq('id', recordId);

      return jsonResponse({ success: true });
    }

    // --- BRANCH B: STEP 1 & 2 (DYNAMIC FORENSIC AUDIT) ---
    await supabase.from('audits').update({ status: 'processing' }).eq('id', recordId);

    const flash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const pro = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: {
    response_mime_type: "application/json",
    temperature: 0.1
  }
});
    const { data: audit, error: auditErr } = await supabase
      .from('audits')
      .select('file_path')
      .eq('id', recordId)
      .single();

    if (auditErr || !audit?.file_path) {
      return jsonResponse({
        error: "AUDIT_FILE_NOT_FOUND",
        details: auditErr?.message ?? "Missing file_path"
      }, 404);
    }

    const { data: fileData, error: dlErr } = await supabase.storage
      .from('contracts')
      .download(audit.file_path);

    if (dlErr || !fileData) {
      return jsonResponse({
        error: "FILE_DOWNLOAD_FAILED",
        details: dlErr?.message ?? "No fileData"
      }, 500);
    }

    const filePart = {
      inlineData: {
        data: encodeBase64(new Uint8Array(await fileData.arrayBuffer())),
        mimeType: "application/pdf"
      }
    };

    // STEP 1: HIGH-PRECISION GRANULAR KEY & JURISDICTION ROUTING
    const classResult = await flash.generateContent([
      `ACT AS A LEGAL FORENSIC ROUTER. 
Analyze the provided document and extract the precise classification details.

--- SELECTION LIST (type_key) ---
You MUST select exactly ONE of the following keys:
1.  'Commercial_Lease'
2.  'Residential_Lease'
3.  'IT_Services'
4.  'SaaS_Agreement'
5.  'Contractor_Agt'
6.  'Executive_Employment'
7.  'Auto_Insurance'
8.  'Cyber_Insurance'
9.  'Home_Insurance'
10. 'Credit_Agreement'
11. 'Mortgage_Deed'
12. 'Unsecured_Loan'
13. 'NDA'
14. 'Settlement_Agt'
15. 'General'

--- JURISDICTION RULES (jurisdiction) ---
1. Detect the governing law country. 
2. If the country is 'India', 'USA', 'Canada', 'UK', 'Australia', or 'UAE', return that name.
3. If the country is NOT in that list, or cannot be determined, return 'General'.

--- OUTPUT FORMAT ---
Return ONLY a valid JSON object.
JSON: { 
  "type_key": "", 
  "jurisdiction": "", 
  "lang": "", 
  "detected_country": "" 
}`,
      filePart
    ]);

    const docContext = extractFirstJsonObject(classResult.response.text());

    // FIX: normalize jurisdiction so your DB doesn't have to store "Ontario, Canada"
    docContext.jurisdiction = normalizeJurisdiction(docContext.jurisdiction);

    // 2A: FETCH SCORING CRITERIA
    const { data: scoringCriteria, error: scoringErr } = await supabase.from('scoring_criteria')
      .select('*')
      .eq('type_key', docContext.type_key)
      .or(`org_id.eq.${orgId ?? '00000000-0000-0000-0000-000000000000'},org_id.is.null`)
      .order('org_id', { ascending: false, nullsFirst: false });

    if (scoringErr) {
      console.error("SCORING_CRITERIA_ERROR:", scoringErr.message);
    }

    const scoringManifest = (scoringCriteria || []).map(c => `
FACTOR: ${c.factor_name} | RISK: +${c.deduction_weight} | MITIGATION: -${c.mitigation_credit}
SENSING: ${c.sensing_instruction} | CREDIT_IF: ${c.mitigation_instruction}
`).join('\n');

    // 2B: TRUE WATERFALL RETRIEVAL (org/jurisdiction specificity)
    const registry = await pickPromptRegistry(docContext.type_key, docContext.jurisdiction, orgId);

    if (!registry) {
      return jsonResponse({
        error: "PROMPT_REGISTRY_NOT_FOUND",
        details: `No prompt_registry match for type_key=${docContext.type_key}, jurisdiction=${docContext.jurisdiction}, orgId=${orgId ?? "null"}`
      }, 500);
    }

    // STEP 3: THE FORENSIC AUDIT
    const auditPrompt = `${registry.prompt_text} 
Perform all analysis, including 'ceo_summary', 'issue', and 'script', in ${docContext.lang}.    
- SCORING LOGIC (0-100 BASE):
- Start at 0. Add WEIGHT for risks. Subtract CREDIT for mitigations.
- CRITERIA: ${scoringManifest}
- FINAL_SCORE = (Sum Weights - Sum Credits) / 10.

OUTPUT JSON: { 
  "risk_score": number, // Normalization: 75/100 becomes 7.5
  "ceo_summary": "", 
  "red_flags": [{ "issue": "", "quote": "EXACT_TEXT_FROM_DOCUMENT", "statute": "", "page_ref": "", "script": "", "severity": "" }],
  "sensed_dates": [{ "label": "", "value": "", "page_ref": "" }], 
  "sensed_financials": [{ "label": "", "value": "", "page_ref": "" }], 
  "missing_clauses": [{ "label": "", "desc": "" }] 
}`;

    const auditResult = await pro.generateContent([auditPrompt, filePart]);
    const res = extractFirstJsonObject(auditResult.response.text());

    // DB PERSISTENCE (Final Handshake)
    await supabase.from('audits').update({
      status: 'completed',
      detected_language: String(docContext.lang || "").toUpperCase(),
      document_type: docContext.type_key,
      jurisdiction: res.jurisdiction || docContext.jurisdiction,

      // THE CRITICAL LINKS - No longer null
      prompt_id: registry.id,
      sensing_path: registry.slug || 'fallback-global',

      // keep your normalization exactly as you had it
      risk_score: res.risk_score ? (parseFloat(res.risk_score) / 10) : 10.0,

      verdict: res.ceo_summary,
      meta_data: {
        all_flags: res.red_flags,
        all_dates: res.sensed_dates,
        all_financials: res.sensed_financials
      },
      original_analysis: res,

      // FIX: avoid crash if missing_clauses is null/undefined (NO backslash-template bugs)
      missing_clauses: (res.missing_clauses || []).map((m: any) => `${m.label}: ${m.desc}`),

      updated_at: new Date().toISOString()
    }).eq('id', recordId);

    return jsonResponse({ success: true });

  } catch (error: any) {
    console.error("EDGE_FUNCTION_FATAL:", error?.message ?? error);

    // If recordId exists, mark failed (keeping your pattern)
    if (recordId) {
      try {
        await supabase.from('audits').update({
          status: 'failed',
          verdict: `Forensic Failure: ${error?.message ?? String(error)}`,
          updated_at: new Date().toISOString()
        }).eq('id', recordId);
      } catch (e) {
        console.error("FAILED_STATUS_UPDATE_ERROR:", e?.message ?? e);
      }
    }

    return jsonResponse({ error: error?.message ?? String(error) }, 500);
  }
});