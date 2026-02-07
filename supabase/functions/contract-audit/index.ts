// @ts-nocheck
import { createClient } from 'supabase'
import { GoogleGenerativeAI } from "ai"
import { encodeBase64 } from "@std/encoding/base64"

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  let recordId = null;

  try {
    // --- STEP 1: JWT AUTHENTICATION GATEKEEPER ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("No Authorization header provided.");

    const token = authHeader.replace('Bearer ', '');
    // Verify user identity via Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid or expired session token.");
    }

    const userId = user.id; // Pull verified ID directly from the token

    const body = await req.json();
    recordId = body.record?.id || body.id;
    const targetLanguage = body.language || "English";
    const translation_only = body.translation_only || false;

    if (!recordId) throw new Error("Missing Record Context.");

    // --- STEP 2: FETCH RECORD & PREVIOUS STATE ---
    const { data: audit } = await supabase.from('audits').select('*').eq('id', recordId).single();
    if (!audit) throw new Error("Audit record not found.");
    
    const wasAlreadyCompleted = audit.status === 'completed';

    // --- BRANCH A: CACHED TRANSLATION (STAYS 0 CREDITS) ---
    if (translation_only) {
      const existingVault = audit.translations || {};
      
      if (existingVault[targetLanguage] || targetLanguage.toUpperCase() === audit.detected_language) {
        return new Response(JSON.stringify({ success: true, cached: true }), { headers: corsHeaders });
      }

      const translator = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview", 
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 } 
      });

      const transPrompt = `Translate to ${targetLanguage}: { "v": "${audit.verdict}", "f": ${JSON.stringify(audit.meta_data?.all_flags)}, "m": ${JSON.stringify(audit.missing_clauses)} }. Return JSON: { "verdict": "", "flags": [], "gaps": [] }`;
      
      const result = await translator.generateContent(transPrompt);
      const cleanJson = JSON.parse(result.response.text().match(/\{[\s\S]*\}/)![0]);

      const formattedVaultData = {
        verdict: cleanJson.verdict || cleanJson.v || "",
        gaps: (cleanJson.gaps || cleanJson.missing_clauses || cleanJson.m || []).map(g => 
          typeof g === 'object' ? `${g.label || g.type}: ${g.desc || g.description}` : String(g)
        ),
        flags: (cleanJson.flags || cleanJson.all_flags || cleanJson.red_flags || cleanJson.f || []).map(f => ({
          issue: String(f.issue || f.label || "Issue"),
          quote: String(f.quote || f.evidence || "N/A"),
          script: String(f.script || f.negotiation || "N/A"),
          severity: String(f.severity || "high").toLowerCase()
        })),
        dates: audit.meta_data?.all_dates || [],
        financials: audit.meta_data?.all_financials || []
      };

      await supabase.from('audits').update({ 
        translations: { ...existingVault, [targetLanguage]: formattedVaultData },
        updated_at: new Date().toISOString()
      }).eq('id', recordId);

      return new Response(JSON.stringify({ success: true, cached: false }), { headers: corsHeaders });
    }

    // --- BRANCH B: DYNAMIC AUDIT (UNTOUCHED WORKING CODE) ---
    await supabase.from('audits').update({ 
      status: 'processing', 
      risk_score: null 
    }).eq('id', recordId);

    const flash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const pro = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: { response_mime_type: "application/json" } });

    const { data: fileData } = await supabase.storage.from('contracts').download(audit.file_path);
    const base64Data = encodeBase64(new Uint8Array(await fileData.arrayBuffer()));
    const filePart = { inlineData: { data: base64Data, mimeType: "application/pdf" } };

    const classResult = await flash.generateContent([
      `Identify type. RULES:
       - Focus on software hosting/uptime? -> "SaaS_Agreement"
       - Focus on consulting/labor? -> "IT_Services"
       - Real estate fulfillment? -> "Notice_of_Fulfillment"
       - Offer to buy/sell property -> "Real_Estate_Offer"
       MENU: [NDA, SaaS_Agreement, IT_Services, Insurance_Policy, Real_Estate_Offer, Notice_of_Fulfillment, Employment_Agreement, Independent_Contractor, Commercial_Lease, Residential_Lease, General].
       JSON: { "type": "", "lang": "" }`, 
      filePart
    ]);
    const docContext = JSON.parse(classResult.response.text().match(/\{[\s\S]*\}/)![0]);

    const { data: membership } = await supabase.from('memberships').select('organization_id').eq('user_id', userId).single();
    const orgId = membership?.organization_id;

    const { data: registry } = await supabase.from('prompt_registry')
      .select('prompt_text, slug')
      .or(`and(doc_type.eq.${docContext.type},org_id.eq.${orgId}),and(doc_type.eq.${docContext.type},is_default.eq.true),is_default.eq.true`)
      .order('org_id', { ascending: false, nullsFirst: false }).order('is_default', { ascending: true }).limit(1).single();

    const activePrompt = registry?.prompt_text || "Perform a general 50-point forensic audit.";
    
    const auditPrompt = `${activePrompt} Output in ${targetLanguage}. Quotes remain in ${docContext.lang}. 
    INSTRUCTION: 1. Identify EXACT jurisdiction (State/Province and Country). 
    2. Exhaustively identify EVERY signature timestamp, irrevocability deadline, and fiscal amount. 
    JSON: { "document_title": "", "jurisdiction": "", "party_a": {"name": ""}, "party_b": {"name": ""}, "effective_date": "", "contract_value": "", "risk_score": 0, "ceo_summary": "", "red_flags": [ { "issue": "", "quote": "", "script": "", "severity": "" } ], "sensed_dates": [ { "label": "", "value": "" } ], "sensed_financials": [ { "label": "", "value": "" } ], "missing_clauses": [ { "label": "", "desc": "" } ] }`;
    
    const auditResult = await pro.generateContent([auditPrompt, filePart]);
    const auditJson = JSON.parse(auditResult.response.text().match(/\{[\s\S]*\}/)![0]);

    const cleanedFlags = (auditJson.red_flags || auditJson.all_flags || []).map(f => ({
      issue: f.issue || f.label || "Conflict Detected", 
      quote: f.quote || f.evidence || "N/A", 
      script: f.script || f.negotiation || "N/A", 
      severity: (f.severity || "high").toLowerCase()
    }));
    const cleanedDates = (auditJson.sensed_dates || auditJson.all_dates || []).map(d => ({ label: d.label || d.name || "Key Date", value: d.value || d.date || "TBD" }));
    const cleanedFinancials = (auditJson.sensed_financials || auditJson.all_financials || []).map(f => ({ label: f.label || f.description || "Fiscal Point", value: f.value || f.amount || "TBD" }));
    const cleanedGaps = (auditJson.missing_clauses || []).map(g => typeof g === 'object' ? `${g.label || g.type || g.CLAUSE_TYPE}: ${g.desc || g.DESCRIPTION || ''}` : String(g));

    await supabase.from('audits').update({
      status: 'completed',
      detected_language: targetLanguage.toUpperCase(),
      document_type: auditJson.document_title || docContext.type || "GENERAL",
      jurisdiction: auditJson.jurisdiction || "N/A",
      sensing_path: registry?.slug || "fallback-global",
      risk_score: Math.max(1, Math.min(10, auditJson.risk_score || 5)),
      verdict: auditJson.ceo_summary || auditJson.verdict,
      party_a_name: auditJson.party_a?.name || auditJson.party_a || "Detected",
      party_b_name: auditJson.party_b?.name || auditJson.party_b || "Detected",
      effective_date: auditJson.effective_date || "N/A",
      contract_value: auditJson.contract_value || "TBD",
      missing_clauses: cleanedGaps,
      meta_data: { all_flags: cleanedFlags, all_dates: cleanedDates, all_financials: cleanedFinancials },
      original_analysis: auditJson,
      updated_at: new Date().toISOString()
    }).eq('id', recordId);

    if (!body.retry_mode || wasAlreadyCompleted) {
      await supabase.rpc('deduct_credit', { p_user_id: userId });
    }
    
    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

  } catch (error) {
    if (recordId) {
      await supabase.from('audits').update({ 
        status: 'failed', 
        verdict: `Forensic Failure: ${error.message}` 
      }).eq('id', recordId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});