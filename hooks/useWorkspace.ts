import { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";

export function useWorkspace() {
  const [organization, setOrganization] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getOrgData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the first organization the user belongs to
      const { data: membership } = await supabase
        .from('memberships')
        .select('role, organizations(*)')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        setOrganization(membership.organizations);
        setRole(membership.role);
      }
    };
    getOrgData();
  }, []);

  return { organization, role };
}