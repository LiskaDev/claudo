import { useState, useEffect } from 'react';

export interface UsageData {
  fiveHour: number;   // 0-100
  sevenDay: number;   // 0-100
  fiveResetAt: string;
  sevenResetAt: string;
}

async function fetchOrgId(): Promise<string | null> {
  try {
    const res = await fetch('https://claude.ai/api/organizations', { credentials: 'include' });
    const data = await res.json();
    return data?.[0]?.uuid ?? null;
  } catch { return null; }
}

async function fetchUsage(orgId: string): Promise<UsageData | null> {
  try {
    const res = await fetch(`https://claude.ai/api/organizations/${orgId}/usage`, { credentials: 'include' });
    const data = await res.json();
    return {
      fiveHour: data.five_hour?.utilization ?? 0,
      sevenDay: data.seven_day?.utilization ?? 0,
      fiveResetAt: data.five_hour?.resets_at ?? '',
      sevenResetAt: data.seven_day?.resets_at ?? '',
    };
  } catch { return null; }
}

export function useUsageRings() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  const load = async () => {
    const orgId = await fetchOrgId();
    if (!orgId) return;
    const data = await fetchUsage(orgId);
    if (data) setUsage(data);
  };

  useEffect(() => {
    load();
    // Refresh usage every 60 seconds automatically
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return { usage, refresh: load };
}
