import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Play, Square } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ModuleId, SpecialProcessType, WorkshopIncident } from '../../types/erp';
import { formatNumber } from '../../utils/format';

interface WorkshopModulesProps {
  activeModule: ModuleId;
}

export const WorkshopModules: React.FC<WorkshopModulesProps> = ({ activeModule }) => {
  const {
    state,
    checkInProductionOrder,
    checkOutProductionOrder,
    reportWorkshopIncident,
    resolveWorkshopIncident,
  } = useStore();

  const [operatorName, setOperatorName] = useState('Roberto Morales');
  const [stationFilter, setStationFilter] = useState<'Todas' | SpecialProcessType>('Todas');
  const [batchCounts, setBatchCounts] = useState<
    Record<string, { producidas: number; merma: number }>
  >({});

  // Incident form
  const [incOpFolio, setIncOpFolio] = useState('');
  const [incEstacion, setIncEstacion] = useState<SpecialProcessType>('Bordado');
  const [incTipo, setIncTipo] = useState<WorkshopIncident['tipo']>('Falla de Maquinaria');
  const [incSeveridad, setIncSeveridad] = useState<WorkshopIncident['severidad']>('Media');
  const [incDescripcion, setIncDescripcion] = useState('');

  const activeOps = state.productionOrders.filter((op) => {
    const isPending = op.estatus !== 'Liberada QA';
    const matchesStation = stationFilter === 'Todas' || op.estacionActual === stationFilter;
    return isPending && matchesStation;
  });

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDescripcion.trim()) return;
    reportWorkshopIncident({
      opFolio: incOpFolio || state.productionOrders[0]?.opFolio || 'GENERAL',
      estacion: incEstacion,
      tipo: incTipo,
      severidad: incSeveridad,
      descripcion: incDescripcion.trim(),
      reportadoPor: operatorName,
    });
    setIncDescripcion('');
  };

  if (activeModule === 'taller_tareas') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Tareas Asignadas en Taller
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Panel táctil para estaciones de Corte, Bordado, Estampado/Sublimado y Confección
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['Todas', 'Corte', 'Bordado', 'Estampado y Sublimado', 'Confección Textil'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStationFilter(st)}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    stationFilter === st
                      ? 'bg-[#2A7CFA] text-white'
                      : 'border border-black/15 bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {activeOps.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center text-xs text-neutral-500">
            No hay órdenes de trabajo asignadas para esta estación.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOps.map((op) => {
              const remaining = Math.max(0, op.cantidadPlaneada - op.cantidadProducida);
              const pct = Math.min(
                100,
                Math.round((op.cantidadProducida / Math.max(1, op.cantidadPlaneada)) * 100)
              );

              return (
                <div
                  key={op.id}
                  className="rounded-xl border border-black/15 bg-white p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-sm font-extrabold text-[#1E2EB9]">
                      {op.opFolio}
                    </span>
                    <span className="text-xs font-bold text-black">{op.estacionActual}</span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-black">{op.productoNombre}</h2>
                    <p className="text-xs text-neutral-700 mt-0.5">
                      {op.maquinaOLinea} · Ficha {op.fichaCodigo}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono-tabular">
                      <span>Producidas: {formatNumber(op.cantidadProducida)}</span>
                      <span>Meta: {formatNumber(op.cantidadPlaneada)} uds ({pct}%)</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full bg-[#2A7CFA] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <span className="text-xs font-semibold text-neutral-700">
                      Restantes: <strong className="font-mono-tabular">{remaining} uds</strong>
                    </span>

                    {op.estatus === 'Calendarizada' ? (
                      <button
                        type="button"
                        onClick={() => checkInProductionOrder(op.id, operatorName)}
                        className="min-h-[46px] inline-flex items-center gap-2 rounded-xl bg-[#2A7CFA] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1E2EB9] cursor-pointer"
                      >
                        <Play className="h-4 w-4" />
                        <span>Iniciar Lote (Check-in)</span>
                      </button>
                    ) : op.estatus === 'En Proceso' ? (
                      <button
                        type="button"
                        onClick={() =>
                          checkOutProductionOrder(op.id, Math.min(remaining, 100), 0, operatorName)
                        }
                        className="min-h-[46px] inline-flex items-center gap-2 rounded-xl bg-[#1E2EB9] px-5 py-2.5 text-sm font-bold text-white hover:bg-black cursor-pointer"
                      >
                        <Square className="h-4 w-4" />
                        <span>Registrar Avance (+{Math.min(remaining, 100)} uds)</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#2A7CFA]">
                        Enviada a Inspección QA
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeModule === 'taller_avance') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Registro de Avance (Check-in / Check-out)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Medición de tiempos de ciclo reales, piezas completadas y envío a Control de Calidad
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-black">Operador:</label>
            <input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {state.productionOrders
            .filter((op) => op.estatus !== 'Liberada QA' && op.estatus !== 'Terminada Piso')
            .map((op) => {
              const remaining = Math.max(0, op.cantidadPlaneada - op.cantidadProducida);
              const entry = batchCounts[op.id] || {
                producidas: remaining,
                merma: 0,
              };

              return (
                <div
                  key={op.id}
                  className="rounded-xl border border-black/15 bg-white p-5 space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">{op.opFolio}</span>
                    <span className="font-mono-tabular text-neutral-600">
                      {op.checkInHora ? `Inicio: ${op.checkInHora}` : 'Sin Check-in'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-black">
                    {op.productoNombre} ({op.estacionActual})
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">
                        Prendas Terminadas
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={entry.producidas}
                        onChange={(e) =>
                          setBatchCounts((prev) => ({
                            ...prev,
                            [op.id]: { ...entry, producidas: Number(e.target.value) },
                          }))
                        }
                        className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm font-mono-tabular font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">
                        Merma en Estación
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={entry.merma}
                        onChange={(e) =>
                          setBatchCounts((prev) => ({
                            ...prev,
                            [op.id]: { ...entry, merma: Number(e.target.value) },
                          }))
                        }
                        className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm font-mono-tabular font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => checkInProductionOrder(op.id, operatorName)}
                      className="min-h-[44px] flex-1 rounded-lg border border-[#2A7CFA] bg-[#2A7CFA]/10 px-4 py-2 text-xs font-bold text-[#1E2EB9] hover:bg-[#2A7CFA]/20 cursor-pointer"
                    >
                      Check-in Estación
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        checkOutProductionOrder(op.id, entry.producidas, entry.merma, operatorName)
                      }
                      className="min-h-[44px] flex-1 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E2EB9] cursor-pointer"
                    >
                      Check-out y Reportar Avance
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          <div className="border-b border-black/10 px-4 py-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#2A7CFA]" />
            <h2 className="text-sm font-bold text-black">Bitácora de Tiempos de Ciclo</h2>
          </div>
          {state.cycleLogs.length === 0 ? (
            <p className="p-6 text-center text-xs text-neutral-500">
              Aún no hay registros de Check-out completados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">OP</th>
                    <th className="px-4 py-3 font-bold">Estación / Operador</th>
                    <th className="px-4 py-3 font-bold font-mono-tabular">Horario</th>
                    <th className="px-4 py-3 font-bold text-right">Completadas</th>
                    <th className="px-4 py-3 font-bold text-right">Merma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.cycleLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 font-mono-tabular font-bold text-[#1E2EB9]">
                        {log.opFolio}
                      </td>
                      <td className="px-4 py-3">
                        {log.estacion} · {log.operador}
                      </td>
                      <td className="px-4 py-3 font-mono-tabular">
                        {log.horaInicio} → {log.horaFin || 'En curso'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-bold text-black">
                        {formatNumber(log.unidadesCompletadas)} uds
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular text-[#E76108]">
                        {log.mermaReportada}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // taller_incidencias
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black">
          Reporte de Incidencias en Piso
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Alertas rápidas por fallas de maquinaria, falta de insumos o defectos en lotes de tela
        </p>
      </div>

      <form
        onSubmit={handleReportIncident}
        className="rounded-xl border border-black/10 bg-white p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">OP Relacionada</label>
            <select
              value={incOpFolio || state.productionOrders[0]?.opFolio || 'GENERAL'}
              onChange={(e) => setIncOpFolio(e.target.value)}
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-xs"
            >
              {state.productionOrders.map((op) => (
                <option key={op.id} value={op.opFolio}>
                  {op.opFolio} — {op.estacionActual}
                </option>
              ))}
              <option value="GENERAL">Mantenimiento General</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Estación</label>
            <select
              value={incEstacion}
              onChange={(e) => setIncEstacion(e.target.value as SpecialProcessType)}
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-xs"
            >
              <option value="Corte">Corte</option>
              <option value="Bordado">Bordado</option>
              <option value="Estampado y Sublimado">Estampado y Sublimado</option>
              <option value="Confección Textil">Confección Textil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Tipo de Incidencia</label>
            <select
              value={incTipo}
              onChange={(e) => setIncTipo(e.target.value as WorkshopIncident['tipo'])}
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-xs"
            >
              <option value="Falla de Maquinaria">Falla de Maquinaria</option>
              <option value="Falta de Insumos">Falta de Insumos</option>
              <option value="Defecto en Lote de Tela">Defecto en Lote de Tela</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Severidad</label>
            <select
              value={incSeveridad}
              onChange={(e) => setIncSeveridad(e.target.value as WorkshopIncident['severidad'])}
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-xs"
            >
              <option value="Alta">Alta (Paro de Línea)</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            required
            value={incDescripcion}
            onChange={(e) => setIncDescripcion(e.target.value)}
            placeholder="Describe brevemente la falla, aguja rota, falta de hilo o defecto en rollo..."
            className="flex-1 rounded-lg border border-black/15 px-3 py-2.5 text-xs"
          />
          <button
            type="submit"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#E76108] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#c85105] cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Enviar Alerta de Taller</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {state.incidents.length === 0 ? (
          <p className="rounded-xl border border-black/10 bg-white p-8 text-center text-xs text-neutral-500">
            Sin incidencias abiertas en piso de producción.
          </p>
        ) : (
          state.incidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-xl border border-black/10 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular font-bold text-[#1E2EB9]">{inc.opFolio}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-black">{inc.tipo}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-bold ${
                      inc.severidad === 'Alta' ? 'text-[#E76108]' : 'text-[#E9BD02]'
                    }`}
                  >
                    Severidad {inc.severidad}
                  </span>
                </div>
                <p className="text-neutral-800">{inc.descripcion}</p>
                <p className="text-[11px] text-neutral-500">
                  {inc.estacion} · Reportó: {inc.reportadoPor} · {inc.fechaReporte}
                </p>
              </div>

              {inc.estatus === 'Abierta' ? (
                <button
                  type="button"
                  onClick={() => resolveWorkshopIncident(inc.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A7CFA] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Marcar Resuelta</span>
                </button>
              ) : (
                <span className="font-bold text-[#2A7CFA]">Resuelta</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
