import React, { useState } from 'react';
import { CheckCircle2, Cpu, FileText, Layers, Plus, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ModuleId, SpecialProcessType } from '../../types/erp';
import { formatNumber } from '../../utils/format';

interface ProductionModulesProps {
  activeModule: ModuleId;
}

export const ProductionModules: React.FC<ProductionModulesProps> = ({ activeModule }) => {
  const {
    state,
    scheduleProductionOrder,
    advanceProcessStation,
    createOrApproveTechSheet,
    approveExistingTechSheet,
    submitQAInspection,
  } = useStore();

  // Schedule OP form (Phase 3 -> Phase 4)
  const [showOpForm, setShowOpForm] = useState(false);
  const [pedidoId, setPedidoId] = useState('');
  const [fichaId, setFichaId] = useState('');
  const [tipoLote, setTipoLote] = useState<'Línea' | 'Temporada'>('Línea');
  const [estacionInicial, setEstacionInicial] = useState<SpecialProcessType>('Corte');
  const [maquina, setMaquina] = useState('Mesa de Corte Automática #01');
  const [operador, setOperador] = useState('Roberto Morales');
  const [fechaProgramada, setFechaProgramada] = useState('2026-11-14');
  const [opFeedback, setOpFeedback] = useState<string | null>(null);

  // Special Processes switcher inside module (Bordado / Estampado y Sublimado / Confección Textil)
  const [processView, setProcessView] = useState<
    'Bordado' | 'Estampado y Sublimado' | 'Confección Textil'
  >('Bordado');

  // Tech Sheet form (Phase 2)
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [sheetOrderId, setSheetOrderId] = useState('');
  const [sheetProductId, setSheetProductId] = useState('');
  const [pantonesText, setPantonesText] = useState('Pantone 2728 C, Pantone 1585 C');
  const [matrizBordado, setMatrizBordado] = useState('MAT_INSTITUCIONAL_2026.DST');
  const [puntadas, setPuntadas] = useState(7200);
  const [metodoEstampado, setMetodoEstampado] = useState('Sublimado Calandra 205°C · 40s');
  const [especCostura, setEspeCostura] = useState('Overlock 4 hilos + doble pespunte');
  const [curvaTallas, setCurvaTallas] = useState('CH 20% · M 35% · G 30% · EG 15%');

  // QA inspection inline state
  const [qaInputs, setQaInputs] = useState<
    Record<string, { muestra: number; defectos: number; obs: string; inspector: string }>
  >({});

  const handleScheduleOp = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOrder = pedidoId || schedulableOrders[0]?.id;
    const targetSheet = fichaId || approvedSheets[0]?.id;
    if (!targetOrder || !targetSheet) return;

    const result = scheduleProductionOrder({
      pedidoId: targetOrder,
      fichaTecnicaId: targetSheet,
      tipoLote,
      estacionInicial,
      maquinaOLinea: maquina,
      operadorAsignado: operador,
      fechaProgramada,
    });
    setOpFeedback(
      result.shortageMessage ||
        'Orden de Producción calendarizada con insumos reservados y enviada a Piso de Taller.'
    );
    setShowOpForm(false);
  };

  const handleCreateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = sheetProductId || state.catalog[0]?.id;
    if (!prodId) return;
    createOrApproveTechSheet({
      pedidoId: sheetOrderId || undefined,
      productoId: prodId,
      pantones: pantonesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      matrizBordado,
      puntadasEstimadas: Number(puntadas),
      metodoEstampado,
      especificacionCostura: especCostura,
      curvaTallas,
      aprobarAhora: true,
    });
    setShowSheetForm(false);
  };

  const schedulableOrders = state.orders.filter(
    (o) => o.faseActual === 2 || o.faseActual === 3
  );
  const approvedSheets = state.techSheets.filter((f) => f.estatus === 'Aprobada y Liberada');

  if (activeModule === 'prod_ordenes') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Gestión de Órdenes de Producción (OP)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Creación, planeación de insumos y seguimiento de lotes de línea y temporada
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOpForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Programar Nueva OP</span>
          </button>
        </div>

        {opFeedback && (
          <div className="rounded-lg border border-[#2A7CFA]/40 bg-[#2A7CFA]/10 p-3 text-xs font-semibold text-[#1E2EB9]">
            {opFeedback}
          </div>
        )}

        {showOpForm && (
          <form
            onSubmit={handleScheduleOp}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Pedido en Diseño / Planeación
              </label>
              <select
                value={pedidoId || schedulableOrders[0]?.id || ''}
                onChange={(e) => setPedidoId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                {schedulableOrders.length === 0 ? (
                  <option value="">Sin pedidos en Fase 2/3</option>
                ) : (
                  schedulableOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.folio} — {o.productoNombre} ({o.cantidad} uds)
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Ficha Técnica Aprobada
              </label>
              <select
                value={fichaId || approvedSheets[0]?.id || ''}
                onChange={(e) => setFichaId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                {approvedSheets.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.codigo} — {f.productoNombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Tipo de Lote</label>
              <select
                value={tipoLote}
                onChange={(e) => setTipoLote(e.target.value as 'Línea' | 'Temporada')}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="Línea">Producto de Línea</option>
                <option value="Temporada">Artículo de Temporada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Estación Inicial
              </label>
              <select
                value={estacionInicial}
                onChange={(e) => setEstacionInicial(e.target.value as SpecialProcessType)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="Corte">Corte</option>
                <option value="Bordado">Bordado</option>
                <option value="Estampado y Sublimado">Estampado y Sublimado</option>
                <option value="Confección Textil">Confección Textil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Máquina o Línea asignada
              </label>
              <input
                value={maquina}
                onChange={(e) => setMaquina(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Operador & Fecha
              </label>
              <div className="flex gap-2">
                <input
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
                />
                <input
                  type="date"
                  value={fechaProgramada}
                  onChange={(e) => setFechaProgramada(e.target.value)}
                  className="rounded-lg border border-black/15 px-2 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={schedulableOrders.length === 0 || approvedSheets.length === 0}
                  className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  Crear OP
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.productionOrders.length === 0 ? (
            <p className="p-8 text-center text-xs text-neutral-500">
              No hay Órdenes de Producción activas. Programa una OP a partir de un pedido validado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">OP / Pedido</th>
                    <th className="px-4 py-3 font-bold">Producto y Ficha</th>
                    <th className="px-4 py-3 font-bold">Estación Actual</th>
                    <th className="px-4 py-3 font-bold text-right">Avance Lote</th>
                    <th className="px-4 py-3 font-bold">Insumos</th>
                    <th className="px-4 py-3 font-bold">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.productionOrders.map((op) => {
                    const pct = Math.min(
                      100,
                      Math.round((op.cantidadProducida / Math.max(1, op.cantidadPlaneada)) * 100)
                    );
                    return (
                      <tr key={op.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <p className="font-mono-tabular font-bold text-[#1E2EB9]">{op.opFolio}</p>
                          <p className="text-[11px] text-neutral-600">
                            {op.pedidoFolio} · {op.tipoLote}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-black">{op.productoNombre}</p>
                          <p className="font-mono-tabular text-[11px] text-neutral-600">
                            Ficha: {op.fichaCodigo}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-black">{op.estacionActual}</p>
                          <p className="text-[11px] text-neutral-600">{op.maquinaOLinea}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono-tabular">
                          <p className="font-bold text-black">
                            {formatNumber(op.cantidadProducida)} / {formatNumber(op.cantidadPlaneada)}
                          </p>
                          <p className="text-[11px] text-neutral-600">
                            {pct}% · Merma: {op.mermaUnidades}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              op.insumosReservados ? 'text-[#2A7CFA]' : 'text-[#E76108]'
                            }`}
                          >
                            {op.insumosReservados ? 'Reservados' : 'Faltante Almacén'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-black">{op.estatus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeModule === 'prod_procesos') {
    const filteredOps = state.productionOrders.filter(
      (op) => op.estacionActual === processView || op.estacionActual === 'Corte'
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Control de Procesos Especiales
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Asignación técnica de máquinas, parámetros de curado, puntadas y líneas de confección
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-black/10 bg-white p-1">
            {(['Bordado', 'Estampado y Sublimado', 'Confección Textil'] as const).map((proc) => (
              <button
                key={proc}
                type="button"
                onClick={() => setProcessView(proc)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  processView === proc
                    ? 'bg-[#1E2EB9] text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>
        </div>

        {/* Ficha de Parámetros del Proceso Activo */}
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-[#2A7CFA]" />
            <h2 className="text-sm font-bold text-black">Estación: {processView}</h2>
          </div>

          {filteredOps.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-500">
              No hay lotes asignados actualmente en {processView}.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOps.map((op) => (
                <div
                  key={op.id}
                  className="rounded-lg border border-black/10 bg-[#F8FAFC] p-4 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">{op.opFolio}</span>
                    <span className="font-semibold text-black">{op.estatus}</span>
                  </div>
                  <p className="text-sm font-bold text-black">{op.productoNombre}</p>
                  <p className="text-neutral-700">
                    Equipo / Línea: <strong>{op.maquinaOLinea}</strong> · Operador:{' '}
                    {op.operadorAsignado}
                  </p>

                  {processView === 'Bordado' && (
                    <div className="rounded border border-black/10 bg-white p-2.5 font-mono-tabular text-[11px] space-y-1">
                      <p>
                        Catálogo Diseño: {op.parametrosProceso.catalogoDiseno || 'MAT_STD.DST'}
                      </p>
                      <p>
                        Puntadas / Prenda: {formatNumber(op.parametrosProceso.puntadas || 6500)}
                      </p>
                    </div>
                  )}

                  {processView === 'Estampado y Sublimado' && (
                    <div className="rounded border border-black/10 bg-white p-2.5 font-mono-tabular text-[11px] space-y-1">
                      <p>
                        Temperatura Plancha / Calandra: {op.parametrosProceso.temperaturaC || 205}°C
                      </p>
                      <p>
                        Tiempo de Curado: {op.parametrosProceso.tiempoCuradoSeg || 42} seg ·{' '}
                        {op.parametrosProceso.papelOTinta || 'Papel Transfer + Tinta CMYK'}
                      </p>
                    </div>
                  )}

                  {processView === 'Confección Textil' && (
                    <div className="rounded border border-black/10 bg-white p-2.5 font-mono-tabular text-[11px] space-y-1">
                      <p>Línea Costura: {op.parametrosProceso.lineaCostura || op.maquinaOLinea}</p>
                      <p>
                        Curva de Tallas y Corte:{' '}
                        {op.parametrosProceso.curvaCorte || 'Curva estándar'}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="font-mono-tabular text-neutral-600">
                      Avance: {op.cantidadProducida} / {op.cantidadPlaneada} uds
                    </span>
                    {op.estacionActual !== processView && (
                      <button
                        type="button"
                        onClick={() =>
                          advanceProcessStation(
                            op.id,
                            processView,
                            processView === 'Bordado'
                              ? 'Bordadora Tajima 12 Cabezas #01'
                              : processView === 'Estampado y Sublimado'
                              ? 'Calandra Térmica Monti #01'
                              : 'Línea Confección A'
                          )
                        }
                        className="rounded-lg bg-[#2A7CFA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                      >
                        Mover Lote a {processView}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeModule === 'prod_fichas') {
    const ordersInDesign = state.orders.filter((o) => o.faseActual === 2);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Control de Diseños y Fichas Técnicas Maestras
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Repositorio de artes gráficos, Pantones, matrices de bordado, especificaciones y liberación
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSheetForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Ficha Técnica</span>
          </button>
        </div>

        {ordersInDesign.length > 0 && (
          <div className="rounded-xl border border-[#E9BD02] bg-[#E9BD02]/10 p-4 text-xs">
            <p className="font-bold text-black">
              Pedidos esperando aprobación de Diseño y Ficha Técnica (Fase 2):
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ordersInDesign.map((o) => (
                <span key={o.id} className="font-mono-tabular font-semibold text-[#1E2EB9]">
                  {o.folio} ({o.productoNombre} · {o.cantidad} uds)
                </span>
              ))}
            </div>
          </div>
        )}

        {showSheetForm && (
          <form
            onSubmit={handleCreateSheet}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Vincular Pedido (Opcional)
              </label>
              <select
                value={sheetOrderId}
                onChange={(e) => setSheetOrderId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="">Ficha de producto general</option>
                {state.orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.folio} — {o.productoNombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Producto</label>
              <select
                value={sheetProductId || state.catalog[0]?.id || ''}
                onChange={(e) => setSheetProductId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                {state.catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Gama de Pantones
              </label>
              <input
                value={pantonesText}
                onChange={(e) => setPantonesText(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Matriz Bordado / Puntadas
              </label>
              <div className="flex gap-2">
                <input
                  value={matrizBordado}
                  onChange={(e) => setMatrizBordado(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
                />
                <input
                  type="number"
                  value={puntadas}
                  onChange={(e) => setPuntadas(Number(e.target.value))}
                  className="w-24 rounded-lg border border-black/15 px-2 py-2 text-xs font-mono-tabular"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Estampado / Sublimado
              </label>
              <input
                value={metodoEstampado}
                onChange={(e) => setMetodoEstampado(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Especificación Costura y Tallas
              </label>
              <div className="flex gap-2">
                <input
                  value={especCostura}
                  onChange={(e) => setEspeCostura(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shrink-0 cursor-pointer"
                >
                  Aprobar y Liberar
                </button>
              </div>
            </div>
          </form>
        )}

        {state.techSheets.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-2">
            <FileText className="h-8 w-8 mx-auto text-neutral-400" />
            <p className="text-sm font-bold text-black">Sin fichas técnicas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.techSheets.map((ft) => (
              <div
                key={ft.id}
                className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">
                      {ft.codigo} · {ft.version}
                    </span>
                    <span className="text-neutral-600">{ft.fechaActualizacion}</span>
                  </div>
                  <h3 className="text-base font-bold text-black">{ft.productoNombre}</h3>
                  <p className="text-neutral-700">
                    <strong>Pantones:</strong> {ft.pantones.join(' · ')}
                  </p>
                  <p className="text-neutral-700">
                    <strong>Bordado:</strong> {ft.matrizBordado} ({formatNumber(ft.puntadasEstimadas)}{' '}
                    puntadas)
                  </p>
                  <p className="text-neutral-700">
                    <strong>Sublimado/Estampado:</strong> {ft.metodoEstampado}
                  </p>
                  <p className="text-neutral-700">
                    <strong>Costura:</strong> {ft.especificacionCostura}
                  </p>
                  <p className="text-neutral-700">
                    <strong>Curva:</strong> {ft.curvaTallas}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-black/10 pt-3 text-xs">
                  <span
                    className={`font-bold ${
                      ft.estatus === 'Aprobada y Liberada' ? 'text-[#2A7CFA]' : 'text-[#E9BD02]'
                    }`}
                  >
                    {ft.estatus}
                  </span>
                  {ft.estatus !== 'Aprobada y Liberada' && (
                    <button
                      type="button"
                      onClick={() => approveExistingTechSheet(ft.id)}
                      className="rounded-lg bg-[#2A7CFA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                    >
                      Aprobar y Liberar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // prod_qa
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black">
          Control de Calidad (QA) — Fase 5
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Inspección de producto terminado: Aprobado (libera a Almacén PT), Con observaciones o Rechazado
        </p>
      </div>

      {state.qaInspections.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-2">
          <Layers className="h-8 w-8 mx-auto text-neutral-400" />
          <p className="text-sm font-bold text-black">No hay lotes pendientes de inspección QA</p>
          <p className="text-xs text-neutral-600">
            Cuando el taller complete una Orden de Producción, aparecerá aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.qaInspections.map((qa) => {
            const draft = qaInputs[qa.id] || {
              muestra: qa.muestraRevisada,
              defectos: qa.defectosEncontrados,
              obs: qa.observaciones,
              inspector: 'Ing. Sofía Delgado',
            };
            const setDraft = (patch: Partial<typeof draft>) =>
              setQaInputs((prev) => ({ ...prev, [qa.id]: { ...draft, ...patch } }));

            return (
              <div
                key={qa.id}
                className="rounded-xl border border-black/10 bg-white p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono-tabular text-xs font-bold text-[#1E2EB9]">
                      {qa.opFolio} · Lote de {formatNumber(qa.loteCantidad)} prendas
                    </p>
                    <h3 className="text-base font-bold text-black">{qa.productoNombre}</h3>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      qa.resultado === 'Aprobado'
                        ? 'text-[#2A7CFA]'
                        : qa.resultado === 'Rechazado'
                        ? 'text-[#E76108]'
                        : 'text-[#E9BD02]'
                    }`}
                  >
                    Resultado: {qa.resultado} ({qa.mermaPorcentaje}% merma)
                  </span>
                </div>

                {qa.resultado === 'Pendiente' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-black/10">
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">
                        Muestra revisada
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={draft.muestra}
                        onChange={(e) => setDraft({ muestra: Number(e.target.value) })}
                        className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">
                        Defectos detectados
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={draft.defectos}
                        onChange={(e) => setDraft({ defectos: Number(e.target.value) })}
                        className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-black mb-1">
                        Observaciones QA
                      </label>
                      <input
                        value={draft.obs}
                        onChange={(e) => setDraft({ obs: e.target.value })}
                        className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-4 flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          submitQAInspection({
                            qaId: qa.id,
                            muestraRevisada: draft.muestra,
                            defectosEncontrados: draft.defectos,
                            resultado: 'Aprobado',
                            observaciones: draft.obs,
                            inspector: draft.inspector,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aprobar y Liberar a Producto Terminado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          submitQAInspection({
                            qaId: qa.id,
                            muestraRevisada: draft.muestra,
                            defectosEncontrados: draft.defectos,
                            resultado: 'Con observaciones',
                            observaciones: draft.obs,
                            inspector: draft.inspector,
                          })
                        }
                        className="rounded-lg border border-[#E9BD02] bg-[#E9BD02]/15 px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#E9BD02]/25 cursor-pointer"
                      >
                        Con Observaciones (Reparación)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          submitQAInspection({
                            qaId: qa.id,
                            muestraRevisada: draft.muestra,
                            defectosEncontrados: draft.defectos,
                            resultado: 'Rechazado',
                            observaciones: draft.obs,
                            inspector: draft.inspector,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E76108] px-3.5 py-2 text-xs font-semibold text-[#E76108] hover:bg-[#E76108]/10 cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        <span>Rechazar (Merma)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-700 border-t border-black/10 pt-3">
                    Inspector: {qa.inspector} · Fecha: {qa.fechaInspeccion} · {qa.observaciones}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
