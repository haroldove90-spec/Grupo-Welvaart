import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileCheck2,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '../../data/initialData';
import { useStore } from '../../context/StoreContext';
import { ModuleId, RoleId } from '../../types/erp';
import { formatMXN, formatNumber } from '../../utils/format';
import { WorkflowPipelineStrip } from '../WorkflowPipelineStrip';

interface AdminModulesProps {
  activeModule: ModuleId;
  onOpenDataModal: () => void;
}

export const AdminModules: React.FC<AdminModulesProps> = ({
  activeModule,
  onOpenDataModal,
}) => {
  const {
    state,
    addUser,
    toggleUserActive,
    deleteUser,
    emitCFDIInvoice,
    markInvoicePaid,
    resolveAuthorization,
  } = useStore();

  // State for new user modal/inline form
  const [showUserForm, setShowUserForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<RoleId>('ventas');
  const [userDept, setUserDept] = useState('Comercial');

  // State for CFDI 4.0 emission
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [usoCfdi, setUsoCfdi] = useState('G01 - Adquisición de mercancías');

  // Metrics for Executive Dashboard
  const totalVentas = state.orders.reduce((acc, o) => acc + o.total, 0);
  const totalPlaneado = state.productionOrders.reduce((acc, op) => acc + op.cantidadPlaneada, 0);
  const totalProducido = state.productionOrders.reduce((acc, op) => acc + op.cantidadProducida, 0);
  const totalMerma = state.productionOrders.reduce((acc, op) => acc + op.mermaUnidades, 0);
  const mermaPct = totalProducido > 0 ? ((totalMerma / totalProducido) * 100).toFixed(2) : '0.00';

  const totalShipments = state.shipments.length;
  const deliveredShipments = state.shipments.filter((s) => s.estatus === 'Acuse Confirmado').length;
  const cumplimientoPct =
    totalShipments > 0 ? Math.round((deliveredShipments / totalShipments) * 100) : 0;

  const ingresosCobrados = state.invoices
    .filter((f) => f.estatusPago === 'Pagada')
    .reduce((acc, f) => acc + f.total, 0);
  const cuentasPorCobrar = state.invoices
    .filter((f) => f.estatusPago === 'Por Cobrar')
    .reduce((acc, f) => acc + f.total, 0);
  const egresosInsumos = state.rawMaterials.reduce(
    (acc, m) => acc + m.stockActual * m.costoUnitario * 0.25,
    0
  );
  const flujoCajaNeto = ingresosCobrados - egresosInsumos;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;
    addUser({
      nombre: userName.trim(),
      correo: userEmail.trim(),
      rol: userRole,
      departamento: userDept.trim() || 'General',
    });
    setUserName('');
    setUserEmail('');
    setShowUserForm(false);
  };

  if (activeModule === 'admin_dashboard') {
    const ordersDeliveredForBilling = state.orders.filter(
      (o) => o.estatus === 'Entregado' && !state.invoices.some((i) => i.pedidoId === o.id)
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
              Dashboard Ejecutivo
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Indicadores clave de producción, ventas, mermas, cumplimiento a tiendas y flujo de caja
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDataModal}
            className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-3.5 py-2 text-xs font-semibold text-black hover:border-[#E76108] hover:text-[#E76108] transition-colors cursor-pointer"
          >
            <Database className="h-4 w-4" />
            <span>Borrar datos de muestra / Supabase</span>
          </button>
        </div>

        {/* KPIs Ejecutivos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Volumen de Producción</p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-black">
              {formatNumber(totalProducido)}
            </p>
            <p className="mt-1 text-xs text-neutral-600 font-mono-tabular">
              de {formatNumber(totalPlaneado)} prendas planeadas
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Ventas Totales</p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-[#1E2EB9]">
              {formatMXN(totalVentas)}
            </p>
            <p className="mt-1 text-xs text-neutral-600 font-mono-tabular">
              {state.orders.length} pedidos comerciales activos
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Índice de Mermas</p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-[#E76108]">
              {mermaPct}%
            </p>
            <p className="mt-1 text-xs text-neutral-600 font-mono-tabular">
              {formatNumber(totalMerma)} prendas con defecto
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Cumplimiento a Tiendas</p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-[#2A7CFA]">
              {cumplimientoPct}%
            </p>
            <p className="mt-1 text-xs text-neutral-600 font-mono-tabular">
              {deliveredShipments} de {totalShipments} acuses confirmados
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4 sm:col-span-2 xl:col-span-1">
            <p className="text-xs font-semibold text-neutral-600">Flujo de Caja Neto</p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-black">
              {formatMXN(Math.round(flujoCajaNeto))}
            </p>
            <p className="mt-1 text-xs text-neutral-600 font-mono-tabular">
              Por cobrar: {formatMXN(cuentasPorCobrar)}
            </p>
          </div>
        </section>

        {/* Flujo de Trabajo 7 Fases */}
        <WorkflowPipelineStrip />

        {/* Resumen Operativo Dual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h2 className="text-sm font-bold text-black">
                Pedidos en Curso por Fase Operativa
              </h2>
              <span className="text-xs font-mono-tabular text-neutral-600">
                {state.orders.length} registros
              </span>
            </div>

            {state.orders.length === 0 ? (
              <p className="py-8 text-center text-xs text-neutral-500">
                Sin pedidos registrados. Crea pedidos desde Ventas o Portales PO.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-black/10">
                {state.orders.slice(0, 6).map((ord) => (
                  <div
                    key={ord.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-black truncate">
                        <span className="font-mono-tabular text-[#1E2EB9]">{ord.folio}</span> ·{' '}
                        {ord.clienteNombre}
                      </p>
                      <p className="text-neutral-600 truncate">
                        {ord.productoNombre} · {formatNumber(ord.cantidad)} uds
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-black">Fase {ord.faseActual}/7</p>
                      <p className="text-neutral-600">{ord.estatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h2 className="text-sm font-bold text-black">
                Pendientes Críticos de Dirección
              </h2>
              <span className="text-xs font-mono-tabular text-[#E76108] font-semibold">
                {state.authorizations.filter((a) => a.estatus === 'Pendiente').length} autorizaciones
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {ordersDeliveredForBilling.length > 0 && (
                <div className="rounded-lg border border-[#2A7CFA]/30 bg-[#2A7CFA]/8 p-3 text-xs">
                  <p className="font-bold text-[#1E2EB9]">
                    {ordersDeliveredForBilling.length} pedido(s) con acuse confirmado listo para
                    CFDI 4.0
                  </p>
                  <p className="text-neutral-700 mt-0.5">
                    Ingresa a Módulo Financiero y Facturación para timbrar y cerrar el ciclo.
                  </p>
                </div>
              )}

              {state.authorizations.filter((a) => a.estatus === 'Pendiente').length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-500">
                  No hay autorizaciones especiales pendientes.
                </p>
              ) : (
                state.authorizations
                  .filter((a) => a.estatus === 'Pendiente')
                  .map((auth) => (
                    <div
                      key={auth.id}
                      className="rounded-lg border border-black/10 bg-[#F8FAFC] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-black">{auth.titulo}</p>
                        <p className="text-neutral-600">
                          {auth.tipo} · {auth.solicitante} ·{' '}
                          <span className="font-mono-tabular font-semibold text-black">
                            {formatMXN(auth.montoImpacto)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => resolveAuthorization(auth.id, 'Aprobada')}
                          className="rounded-md bg-[#2A7CFA] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => resolveAuthorization(auth.id, 'Rechazada')}
                          className="rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-100 cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModule === 'admin_usuarios') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Gestión de Usuarios y Permisos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Alta, baja y control de accesos por perfiles y departamentos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUserForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {showUserForm && (
          <form
            onSubmit={handleCreateUser}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nombre completo</label>
              <input
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. Laura Gómez"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Correo institucional</label>
              <input
                required
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="nombre@grupowelvaart.mx"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Rol asignado</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as RoleId)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
              >
                {ROLE_DEFINITIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Departamento</label>
              <div className="flex gap-2">
                <input
                  value={userDept}
                  onChange={(e) => setUserDept(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 shrink-0 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.users.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-black">No hay usuarios registrados</p>
              <p className="text-xs text-neutral-600">
                Da de alta al primer integrante de Grupo Welvaart para asignar permisos por área.
              </p>
              <button
                type="button"
                onClick={() => setShowUserForm(true)}
                className="rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Registrar primer usuario
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Usuario</th>
                    <th className="px-4 py-3 font-bold">Departamento</th>
                    <th className="px-4 py-3 font-bold">Perfil</th>
                    <th className="px-4 py-3 font-bold">Permisos</th>
                    <th className="px-4 py-3 font-bold">Estado</th>
                    <th className="px-4 py-3 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.users.map((u) => {
                    const roleLabel =
                      ROLE_DEFINITIONS.find((r) => r.id === u.rol)?.shortLabel || u.rol;
                    return (
                      <tr key={u.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <p className="font-bold text-black">{u.nombre}</p>
                          <p className="text-neutral-600">{u.correo}</p>
                        </td>
                        <td className="px-4 py-3 text-neutral-800">{u.departamento}</td>
                        <td className="px-4 py-3 font-semibold text-[#1E2EB9]">{roleLabel}</td>
                        <td className="px-4 py-3 text-neutral-700">{u.permisos.join(' · ')}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              u.activo ? 'text-[#2A7CFA]' : 'text-[#E76108]'
                            }`}
                          >
                            {u.activo ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleUserActive(u.id)}
                              className="inline-flex items-center gap-1 rounded border border-black/15 px-2.5 py-1 text-xs font-medium text-black hover:bg-neutral-100 cursor-pointer"
                              title={u.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                            >
                              {u.activo ? (
                                <UserX className="h-3.5 w-3.5 text-[#E76108]" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5 text-[#2A7CFA]" />
                              )}
                              <span>{u.activo ? 'Baja' : 'Activar'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(u.id)}
                              className="rounded border border-black/15 p-1.5 text-neutral-600 hover:text-[#E76108] cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
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

  if (activeModule === 'admin_finanzas') {
    const billableOrders = state.orders.filter(
      (o) =>
        (o.estatus === 'Entregado' || o.faseActual >= 6) &&
        !state.invoices.some((i) => i.pedidoId === o.id)
    );

    const handleEmitCFDI = (e: React.FormEvent) => {
      e.preventDefault();
      const targetId = selectedOrderId || billableOrders[0]?.id;
      if (!targetId) return;
      emitCFDIInvoice(targetId, usoCfdi);
      setSelectedOrderId('');
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black">
            Módulo Financiero y Facturación Electrónica (CFDI 4.0)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Control de ingresos, gastos, cuentas por cobrar a cadenas comerciales y timbrado CFDI 4.0
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Ingresos Cobrados</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-[#2A7CFA]">
              {formatMXN(ingresosCobrados)}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Cuentas por Cobrar (Cadenas)</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-[#E76108]">
              {formatMXN(cuentasPorCobrar)}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-600">Costo Insumos Estimado</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-black">
              {formatMXN(Math.round(egresosInsumos))}
            </p>
          </div>
        </div>

        {/* Emisor CFDI 4.0 (Fase 7) */}
        <form
          onSubmit={handleEmitCFDI}
          className="rounded-xl border border-black/10 bg-white p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-black">
                Emisión de Factura Electrónica CFDI 4.0 (Fase 7)
              </h2>
              <p className="text-xs text-neutral-600">
                Selecciona un pedido entregado o listo con acuse para generar su CFDI con IVA 16%
              </p>
            </div>
          </div>

          {billableOrders.length === 0 ? (
            <p className="text-xs text-neutral-600 bg-[#F8FAFC] p-3 rounded-lg border border-black/10">
              Todos los pedidos entregados ya cuentan con CFDI 4.0 emitido.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Pedido Entregado
                </label>
                <select
                  value={selectedOrderId || billableOrders[0].id}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
                >
                  {billableOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.folio} — {o.clienteNombre} ({formatMXN(o.total)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Uso CFDI 4.0</label>
                <select
                  value={usoCfdi}
                  onChange={(e) => setUsoCfdi(e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs focus:border-[#2A7CFA] focus:outline-none"
                >
                  <option value="G01 - Adquisición de mercancías">
                    G01 - Adquisición de mercancías
                  </option>
                  <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                  <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2EB9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A7CFA] cursor-pointer"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Timbrar CFDI 4.0</span>
              </button>
            </div>
          )}
        </form>

        {/* Tabla de Facturas */}
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.invoices.length === 0 ? (
            <p className="p-8 text-center text-xs text-neutral-500">
              Aún no se han emitido facturas CFDI 4.0.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Serie / Folio</th>
                    <th className="px-4 py-3 font-bold">Receptor / RFC</th>
                    <th className="px-4 py-3 font-bold">Folio Fiscal (UUID)</th>
                    <th className="px-4 py-3 font-bold text-right">Total MXN</th>
                    <th className="px-4 py-3 font-bold">Estatus</th>
                    <th className="px-4 py-3 font-bold text-right">Conciliación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-mono-tabular font-bold text-black">
                        {inv.serieFolio}
                        <div className="text-[11px] font-normal text-neutral-600">
                          {inv.pedidoFolio} · {inv.fechaEmision}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-black">{inv.clienteNombre}</p>
                        <p className="font-mono-tabular text-[11px] text-neutral-600">
                          {inv.rfcReceptor} · {inv.usoCfdi}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono-tabular text-[11px] text-neutral-700">
                        {inv.uuid}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-bold text-black">
                        {formatMXN(inv.total)}
                        <div className="text-[11px] font-normal text-neutral-600">
                          Sub: {formatMXN(inv.subtotal)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            inv.estatusPago === 'Pagada' ? 'text-[#2A7CFA]' : 'text-[#E76108]'
                          }`}
                        >
                          {inv.estatusPago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.estatusPago === 'Por Cobrar' ? (
                          <button
                            type="button"
                            onClick={() => markInvoicePaid(inv.id)}
                            className="rounded-lg bg-[#2A7CFA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                          >
                            Registrar Cobro
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-neutral-500">Conciliada</span>
                        )}
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

  // admin_autorizaciones
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black">
          Autorizaciones Especiales
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Aprobación de órdenes de compra de alto valor, descuentos mayoristas y ajustes de inventario
        </p>
      </div>

      {state.authorizations.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center text-xs text-neutral-500">
          No hay solicitudes de autorización registradas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.authorizations.map((auth) => (
            <div
              key={auth.id}
              className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-neutral-600">
                  <span className="font-bold text-[#1E2EB9]">{auth.tipo}</span>
                  <span className="font-mono-tabular">{auth.fechaSolicitud}</span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-black">{auth.titulo}</h3>
                <p className="mt-1.5 text-xs text-neutral-700 leading-relaxed">{auth.detalle}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                  <span>Solicita: {auth.solicitante}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular font-bold text-black">
                    Impacto: {formatMXN(auth.montoImpacto)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/10 pt-3">
                <span
                  className={`text-xs font-bold ${
                    auth.estatus === 'Aprobada'
                      ? 'text-[#2A7CFA]'
                      : auth.estatus === 'Rechazada'
                      ? 'text-[#E76108]'
                      : 'text-[#E9BD02]'
                  }`}
                >
                  Estatus: {auth.estatus}
                </span>

                {auth.estatus === 'Pendiente' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => resolveAuthorization(auth.id, 'Aprobada')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A7CFA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveAuthorization(auth.id, 'Rechazada')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-100 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 text-[#E76108]" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
