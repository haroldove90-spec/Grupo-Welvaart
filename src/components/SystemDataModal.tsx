import React, { useState } from 'react';
import { Database, Trash2, CheckCircle2, AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  clearSupabaseConfig,
  getSavedSupabaseConfig,
  GW_SUPABASE_TABLES,
  saveSupabaseConfig,
} from '../services/supabaseClient';

interface SystemDataModalProps {
  open: boolean;
  onClose: () => void;
}

export const SystemDataModal: React.FC<SystemDataModalProps> = ({ open, onClose }) => {
  const { isSampleCleared, lastClearReport, clearAllSampleData, restoreSampleData, state } =
    useStore();

  const savedConfig = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(savedConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(savedConfig.anonKey);
  const [configSavedNotice, setConfigSavedNotice] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!open) return null;

  const totalRecords =
    state.orders.length +
    state.productionOrders.length +
    state.clients.length +
    state.catalog.length +
    state.rawMaterials.length +
    state.finishedGoods.length +
    state.invoices.length +
    state.shipments.length;

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseKey });
    setConfigSavedNotice('Configuración de Supabase guardada en este navegador.');
    window.setTimeout(() => setConfigSavedNotice(null), 3500);
  };

  const handleClearSupabaseConfig = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setConfigSavedNotice('Credenciales de Supabase removidas.');
    window.setTimeout(() => setConfigSavedNotice(null), 3000);
  };

  const handleExecuteClear = async () => {
    setIsClearing(true);
    await clearAllSampleData();
    setIsClearing(false);
    setConfirmingClear(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-data-title"
    >
      <div className="w-full max-w-xl rounded-xl border border-black/10 bg-white p-6 text-black shadow-xl my-auto">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E2EB9]/10 text-[#1E2EB9]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 id="system-data-title" className="text-base font-bold text-black">
                Gestión de Datos de Muestra y Supabase
              </h2>
              <p className="text-xs text-neutral-600">
                Limpieza persistente en navegador y sincronización de borrado en Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Bloque 1: Borrado de datos de muestra */}
          <div className="rounded-lg border border-black/10 bg-[#F8FAFC] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-black">
                  Borrar datos de muestra de todo el sistema
                </h3>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                  Elimina registros operativos actuales ({totalRecords} registros activos), guarda el
                  bloqueo permanente en el navegador para no volver a mostrar datos de muestra y
                  limpia las tablas en Supabase si está configurado.
                </p>
              </div>
            </div>

            {isSampleCleared && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#2A7CFA]/30 bg-[#2A7CFA]/10 px-3 py-2 text-xs font-medium text-[#1E2EB9]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Bloqueo activo: el navegador no volverá a cargar datos de muestra al recargar.
                </span>
              </div>
            )}

            {lastClearReport && (
              <div className="mt-3 rounded-lg border border-black/10 bg-white p-3 text-xs space-y-1">
                <p className="font-semibold text-black">
                  Última limpieza ejecutada ({lastClearReport.timestamp}):
                </p>
                <p className="text-neutral-700">
                  • Navegador (localStorage): Registros vaciados y supresión persistente activada.
                </p>
                <p className="text-neutral-700">
                  • Supabase:{' '}
                  {!lastClearReport.supabaseResult.configured
                    ? 'Sin credenciales configuradas aún (listo para limpiar al configurar).'
                    : lastClearReport.supabaseResult.errors.length === 0
                    ? `${lastClearReport.supabaseResult.clearedTables.length} tablas limpiadas correctamente.`
                    : `${lastClearReport.supabaseResult.clearedTables.length} tablas limpiadas; ${lastClearReport.supabaseResult.errors.length} avisos de tabla/RLS.`}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!confirmingClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E76108] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#c85105] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Borrar datos de muestra</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E76108]/40 bg-[#E76108]/10 p-2.5 w-full">
                  <AlertTriangle className="h-4 w-4 text-[#E76108] shrink-0" />
                  <span className="text-xs font-semibold text-black mr-auto">
                    ¿Confirmas borrar todos los datos de muestra del sistema?
                  </span>
                  <button
                    type="button"
                    disabled={isClearing}
                    onClick={handleExecuteClear}
                    className="rounded-md bg-[#E76108] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c85105] disabled:opacity-50 cursor-pointer"
                  >
                    {isClearing ? 'Borrando...' : 'Confirmar borrado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {isSampleCleared && (
                <button
                  type="button"
                  onClick={restoreSampleData}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-black cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Cargar muestra nuevamente</span>
                </button>
              )}
            </div>
          </div>

          {/* Bloque 2: Configuración de Supabase */}
          <form onSubmit={handleSaveSupabase} className="rounded-lg border border-black/10 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-black">Conexión Supabase (Opcional)</h3>
              <p className="text-xs text-neutral-600">
                Configura tu proyecto Supabase para que el botón de borrado elimine los registros de
                muestra directamente en tu base de datos remota.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://tu-proyecto.supabase.co"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs text-black placeholder:text-neutral-400 focus:border-[#2A7CFA] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs text-black placeholder:text-neutral-400 focus:border-[#2A7CFA] focus:outline-none"
                />
              </div>
            </div>

            <details className="text-xs text-neutral-600">
              <summary className="cursor-pointer font-medium text-[#1E2EB9] hover:underline">
                Ver tablas vinculadas para limpieza en Supabase ({GW_SUPABASE_TABLES.length})
              </summary>
              <p className="mt-2 font-mono-tabular text-[11px] leading-relaxed text-neutral-700 bg-neutral-50 p-2.5 rounded border border-black/10">
                {GW_SUPABASE_TABLES.join(', ')}
              </p>
            </details>

            {configSavedNotice && (
              <p className="text-xs font-medium text-[#1E2EB9]">{configSavedNotice}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearSupabaseConfig}
                className="text-xs font-medium text-neutral-600 hover:text-black cursor-pointer"
              >
                Limpiar credenciales
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
              >
                Guardar configuración Supabase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
