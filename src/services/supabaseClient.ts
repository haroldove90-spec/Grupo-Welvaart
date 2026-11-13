import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const SUPABASE_CONFIG_KEY = 'gw_supabase_config';

export const GW_SUPABASE_TABLES = [
  'gw_cycle_logs',
  'gw_incidents',
  'gw_authorizations',
  'gw_invoices',
  'gw_shipments',
  'gw_qa_inspections',
  'gw_production_orders',
  'gw_tech_sheets',
  'gw_orders',
  'gw_purchase_orders',
  'gw_finished_goods',
  'gw_raw_materials',
  'gw_catalog',
  'gw_clients',
  'gw_users',
] as const;

export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

  if (typeof window === 'undefined') {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const raw = window.localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SupabaseConfig>;
      return {
        url: (parsed.url || envUrl).trim(),
        anonKey: (parsed.anonKey || envKey).trim(),
      };
    }
  } catch {
    // Fallback to env vars
  }

  return { url: envUrl.trim(), anonKey: envKey.trim() };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    SUPABASE_CONFIG_KEY,
    JSON.stringify({ url: config.url.trim(), anonKey: config.anonKey.trim() })
  );
}

export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SUPABASE_CONFIG_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch {
    return null;
  }
}

export interface SupabaseClearResult {
  configured: boolean;
  clearedTables: string[];
  errors: { table: string; message: string }[];
}

export async function clearSupabaseSampleData(): Promise<SupabaseClearResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      clearedTables: [],
      errors: [],
    };
  }

  const clearedTables: string[] = [];
  const errors: { table: string; message: string }[] = [];

  for (const table of GW_SUPABASE_TABLES) {
    try {
      // Delete all rows where id is not null (standard Supabase bulk delete filter)
      const { error } = await client.from(table).delete().not('id', 'is', null);
      if (error) {
        errors.push({ table, message: error.message });
      } else {
        clearedTables.push(table);
      }
    } catch (err) {
      errors.push({
        table,
        message: err instanceof Error ? err.message : 'Error de red al conectar con Supabase',
      });
    }
  }

  return {
    configured: true,
    clearedTables,
    errors,
  };
}
