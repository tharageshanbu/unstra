"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { useWorkspace } from "@/hooks/useWorkspace";
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import SoloVault from "@/components/SoloVault";
import BusinessCommandCenter from "@/components/BusinessCommandCenter";

const supabase = createClient();

export default function DashboardPage() {
  const router = useRouter();
// FIX: Removed isLoading because it doesn't exist on the return type
const { organization, role } = useWorkspace();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  // Unified Loading State matching the Ledger aesthetic
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
className="flex flex-col w-full">
  
      {/* Standardized Container: 
          Uses flex-1 and overflow-hidden to prevent 
          double-scrollbars and match the Ledger page feel.
      */}

<div className="relative w-full">
    {/* 1. Comment out the organization conditional */}
  {/* {!organization ? ( */}
    
    <SoloVault user={user} />
  
  {/* 2. Comment out the Business branch
  ) : (
    <BusinessCommandCenter org={organization} role={role!} user={user} />
  )} 
  */}
</div>
    </motion.div>
  );
}