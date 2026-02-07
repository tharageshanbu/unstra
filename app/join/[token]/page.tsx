"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

const supabase = createClient();

export default function JoinOrganizationPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [orgName, setOrgName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const processInvitation = async () => {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login but save the current URL so they come back here
        router.push(`/login?returnTo=/join/${token}`);
        return;
      }

      try {
        // 2. Fetch Invite Details
        const { data: invite, error: inviteErr } = await supabase
          .from('organization_invites')
          .select('*, organizations(name)')
          .eq('token', token)
          .single();

        if (inviteErr || !invite) {
          setStatus('error');
          setErrorMsg("This invitation link is invalid or has expired.");
          return;
        }

        setOrgName(invite.organizations.name);

        // 3. Create Membership
        const { error: memErr } = await supabase
          .from('memberships')
          .insert({
            organization_id: invite.organization_id,
            user_id: user.id,
            role: invite.role
          });

        // If user is already a member, it might throw an error - we handle that
        if (memErr && memErr.code !== '23505') throw memErr;

        // 4. Mark token as claimed (optional: delete it)
        await supabase
          .from('organization_invites')
          .delete()
          .eq('token', token);

        setStatus('success');
        
        // Final redirect to the new workspace
        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setErrorMsg("Failed to join organization. You might already be a member.");
      }
    };

    processInvitation();
  }, [token, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900/50 border border-white/5 rounded-[48px] p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20" />
        
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Verifying Invitation</h2>
            <p className="text-zinc-500 text-sm">Validating your security token with the Unstra Vault...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto border border-green-500/20">
              <ShieldCheck className="text-green-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-100">Welcome to {orgName}</h2>
            <p className="text-zinc-500 text-sm">Access granted. Redirecting to your shared intelligence workspace...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-red-500">Invitation Error</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">{errorMsg}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-xs font-black uppercase text-zinc-400 hover:text-white"
            >
              Return to Personal Vault
            </button>
          </div>
        )}
      </div>
    </main>
  );
}