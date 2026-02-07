"use client";

import React, { useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Link, Copy, CheckCircle, RefreshCw, UserPlus } from 'lucide-react';

const supabase = createClient();

export default function InviteLinkGenerator({ orgId }: { orgId: string }) {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: orgId,
        token: token,
        role: 'member'
      });

    if (!error) {
      // Create the full URL based on your current domain
      const url = `${window.location.origin}/join/${token}`;
      setInviteLink(url);
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] w-full max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <UserPlus size={18} />
        </div>
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Team Access Control</h3>
      </div>

      {!inviteLink ? (
        <button 
          onClick={generateLink}
          disabled={isGenerating}
          className="w-full bg-zinc-900 border border-white/10 hover:border-blue-500/50 py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Link size={14} />}
          Generate Secure Invite Link
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <input 
              readOnly
              value={inviteLink}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-[10px] text-zinc-400 font-mono outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 rounded-xl text-blue-500 hover:text-white transition-colors"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-tighter text-center">
            Share this link with your team. Expires in 7 days.
          </p>
          <button 
            onClick={() => setInviteLink("")}
            className="w-full text-[9px] font-black text-zinc-700 hover:text-red-500 uppercase tracking-widest"
          >
            Revoke Link
          </button>
        </div>
      )}
    </div>
  );
}