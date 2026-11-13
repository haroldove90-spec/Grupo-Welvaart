import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Plus, ShoppingBag, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ModuleId } from '../../types/erp';
import { formatMXN, formatNumber } from '../../utils/format';
import { WorkflowPipelineStrip } from '../WorkflowPipelineStrip';

interface SalesModulesProps {
  activeModule: ModuleId;
}

export const SalesModules: React.FC<SalesModulesProps> = ({ activeModule }) => {
  const { state, addCatalogProduct, addClient, createSalesOrder, validatePurchaseOrder } =
    useStore();

  // Catalog form
  const [showProdForm, setShowProdForm] = useState(false);
  const [sku, setSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [coleccion, setColeccion] = useState('Línea Institucional');
  const [temporada, setTemporada] = useState('2026');
  const [categoria, setCategoria] = useState<'Línea' | 'Temporada' | 'Colección Especial'>('Línea');
  const [precioMayoreo, setPrecioMayoreo] = useState(250);
  const [precioMenudeo, setPrecioMenudeo] = useState(420);

  // Client CRM form
  const [showClientForm, setShowClientForm] = useState(false);
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [rfc, setRfc] = useState('');
  const [tipoCliente, setTipoCliente] = useState<
    'Cadena Comercial' | 'Tienda Departamental' | 'Distribuidor Nacional'
  >('Cadena Comercial');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [limiteCredito, setLimiteCredito] = useState(500000);

  // New Order form (Phase 1)
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(200);
  const [tallaResumen, setTallaResumen] = useState('CH(40) M(80) G(60) EG(20)');
  const [color, setColor] = useState('Azul Marino');
  const [fechaCompromiso, setFechaCompromiso] = useState('2026-11-30');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !prodName.trim()) return;
    addCatalogProduct({
      sku: sku.trim().toUpperCase(),
      nombre: prodName.trim(),
      coleccion,
      temporada,
      categoria,
      precioMayoreo: Number(precioMayoreo),
      precioMenudeo: Number(precioMenudeo),
      tallas: ['CH', 'M', 'G', 'EG'],
      colores: ['Azul Marino', 'Negro', 'Blanco'],
      especificacionResumen: 'Especificación textil Grupo Welvaart estándar.',
    });
    setSku('');
    setProdName('');
    setShowProdForm(false);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreComercial.trim() || !rfc.trim()) return;
    addClient({
      razonSocial: razonSocial.trim() || nombreComercial.trim(),
      nombreComercial: nombreComercial.trim(),
      rfc: rfc.trim().toUpperCase(),
      tipo: tipoCliente,
      contacto: contacto.trim() || 'Gerencia Compras',
      telefono: telefono.trim() || '55 0000 0000',
      ciudad: ciudad.trim() || 'Ciudad de México',
      limiteCredito: Number(limiteCredito),
    });
    setRazonSocial('');
    setNombreComercial('');
    setRfc('');
    setShowClientForm(false);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clienteId || state.clients[0]?.id;
    const targetProduct = productoId || state.catalog[0]?.id;
    if (!targetClient || !targetProduct) return;

    const created = createSalesOrder({
      clienteId: targetClient,
      productoId: targetProduct,
      tallaResumen,
      color,
      cantidad: Number(cantidad),
      fechaCompromiso,
    });

    if (created) {
      setOrderNotice(
        created.tipoSuministro === 'Stock Existente'
          ? `Pedido ${created.folio} validado con existencias en Producto Terminado -> pasa directo a Embarques (Fase 6).`
          : `Pedido ${created.folio} requiere Fabricación por Orden (Make-to-Order) -> enviado a Diseño y Fichas Técnicas (Fase 2).`
      );
      setShowOrderForm(false);
    }
  };

  if (activeModule === 'ventas_catalogo') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Catálogo de Productos y Temporadas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Colecciones, ediciones especiales y precios diferenciados por mayoreo y menudeo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProdForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {showProdForm && (
          <form
            onSubmit={handleAddProduct}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">SKU</label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="GW-POL-500"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nombre prenda</label>
              <input
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Chamarra Softshell Corporativa"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value as 'Línea' | 'Temporada' | 'Colección Especial')
                }
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="Línea">Línea</option>
                <option value="Temporada">Temporada</option>
                <option value="Colección Especial">Colección Especial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Colección / Temp.</label>
              <input
                value={coleccion}
                onChange={(e) => setColeccion(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Temporada</label>
              <input
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Precio Mayoreo</label>
              <input
                type="number"
                min={1}
                value={precioMayoreo}
                onChange={(e) => setPrecioMayoreo(Number(e.target.value))}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Precio Menudeo</label>
              <input
                type="number"
                min={1}
                value={precioMenudeo}
                onChange={(e) => setPrecioMenudeo(Number(e.target.value))}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
              >
                Guardar en Catálogo
              </button>
            </div>
          </form>
        )}

        {state.catalog.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-3">
            <ShoppingBag className="h-8 w-8 mx-auto text-neutral-400" />
            <p className="text-sm font-bold text-black">Catálogo vacío</p>
            <p className="text-xs text-neutral-600">
              Agrega modelos de línea, temporada o colección especial para recibir pedidos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.catalog.map((item) => {
              const stockPT = state.finishedGoods
                .filter((fg) => fg.sku === item.sku)
                .reduce((sum, fg) => sum + fg.cantidadDisponible, 0);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span className="font-mono-tabular font-bold text-[#1E2EB9]">{item.sku}</span>
                      <span>
                        {item.categoria} · {item.temporada}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-black">{item.nombre}</h3>
                    <p className="mt-1 text-xs text-neutral-600">{item.especificacionResumen}</p>
                    <p className="mt-2 text-xs text-neutral-700">
                      Tallas: {item.tallas.join(', ')} · Colores: {item.colores.join(', ')}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-black/10 pt-3 text-xs">
                    <div>
                      <span className="block text-neutral-600">Mayoreo</span>
                      <span className="font-mono-tabular text-sm font-bold text-black">
                        {formatMXN(item.precioMayoreo)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-neutral-600">Menudeo</span>
                      <span className="font-mono-tabular text-sm font-bold text-[#1E2EB9]">
                        {formatMXN(item.precioMenudeo)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-neutral-600">Stock PT</span>
                      <span className="font-mono-tabular text-sm font-bold text-[#2A7CFA]">
                        {formatNumber(stockPT)} uds
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeModule === 'ventas_clientes') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Gestión de Clientes (CRM)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Cuentas corporativas, tiendas departamentales y distribuidores del país
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowClientForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Cliente</span>
          </button>
        </div>

        {showClientForm && (
          <form
            onSubmit={handleAddClient}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nombre comercial</label>
              <input
                required
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                placeholder="Sears México"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Razón social</label>
              <input
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Sears Operadora México S.A."
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">RFC</label>
              <input
                required
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                placeholder="SOM950101AB1"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Tipo de cuenta</label>
              <select
                value={tipoCliente}
                onChange={(e) =>
                  setTipoCliente(
                    e.target.value as
                      | 'Cadena Comercial'
                      | 'Tienda Departamental'
                      | 'Distribuidor Nacional'
                  )
                }
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="Cadena Comercial">Cadena Comercial</option>
                <option value="Tienda Departamental">Tienda Departamental</option>
                <option value="Distribuidor Nacional">Distribuidor Nacional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Contacto clave</label>
              <input
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Lic. Ana Paredes"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Teléfono</label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="55 1234 5678"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Ciudad / Plaza</label>
              <input
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Monterrey, NL"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
              >
                Guardar Cuenta
              </button>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.clients.length === 0 ? (
            <p className="p-8 text-center text-xs text-neutral-500">
              Sin clientes registrados en el directorio CRM.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Cuenta / Razón Social</th>
                    <th className="px-4 py-3 font-bold">Segmento</th>
                    <th className="px-4 py-3 font-bold">Contacto</th>
                    <th className="px-4 py-3 font-bold text-right">Límite Crédito</th>
                    <th className="px-4 py-3 font-bold text-right">Saldo por Cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.clients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <p className="font-bold text-black">{cli.nombreComercial}</p>
                        <p className="text-[11px] text-neutral-600">
                          {cli.razonSocial} · RFC:{' '}
                          <span className="font-mono-tabular">{cli.rfc}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3 text-neutral-800">
                        {cli.tipo}
                        <div className="text-[11px] text-neutral-600">{cli.ciudad}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-800">
                        {cli.contacto}
                        <div className="font-mono-tabular text-[11px] text-neutral-600">
                          {cli.telefono}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-semibold text-black">
                        {formatMXN(cli.limiteCredito)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-bold text-[#E76108]">
                        {formatMXN(cli.saldoPendiente)}
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

  if (activeModule === 'ventas_pedidos') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Seguimiento de Pedidos Comerciales (Fase 1 → Fase 7)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Captura con validación automática de stock o disparo a fabricación Make-to-Order
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOrderForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Capturar Pedido</span>
          </button>
        </div>

        {orderNotice && (
          <div className="rounded-lg border border-[#2A7CFA]/40 bg-[#2A7CFA]/10 p-3 text-xs font-semibold text-[#1E2EB9] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{orderNotice}</span>
          </div>
        )}

        <WorkflowPipelineStrip />

        {showOrderForm && (
          <form
            onSubmit={handleCreateOrder}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Cliente</label>
              <select
                value={clienteId || state.clients[0]?.id || ''}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                {state.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreComercial}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Producto Catálogo</label>
              <select
                value={productoId || state.catalog[0]?.id || ''}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                {state.catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.nombre} ({formatMXN(p.precioMayoreo)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Cantidad total</label>
              <input
                type="number"
                min={1}
                required
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Curva de tallas</label>
              <input
                value={tallaResumen}
                onChange={(e) => setTallaResumen(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Color</label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Fecha compromiso
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fechaCompromiso}
                  onChange={(e) => setFechaCompromiso(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={state.clients.length === 0 || state.catalog.length === 0}
                  className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  Validar
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.orders.length === 0 ? (
            <p className="p-8 text-center text-xs text-neutral-500">
              No hay pedidos comerciales en curso. Captura un pedido o procesa una PO de cadena.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Folio / PO</th>
                    <th className="px-4 py-3 font-bold">Cliente</th>
                    <th className="px-4 py-3 font-bold">Producto / Curva</th>
                    <th className="px-4 py-3 font-bold text-right">Volumen / Total</th>
                    <th className="px-4 py-3 font-bold">Suministro</th>
                    <th className="px-4 py-3 font-bold">Fase y Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <p className="font-mono-tabular font-bold text-[#1E2EB9]">{ord.folio}</p>
                        <p className="text-[11px] text-neutral-600">
                          {ord.poReferencia ? `Ref: ${ord.poReferencia}` : `Entrega: ${ord.fechaCompromiso}`}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-black">{ord.clienteNombre}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-black">{ord.productoNombre}</p>
                        <p className="text-[11px] text-neutral-600">
                          {ord.color} · {ord.tallaResumen}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular">
                        <p className="font-bold text-black">{formatNumber(ord.cantidad)} uds</p>
                        <p className="text-[11px] text-neutral-600">{formatMXN(ord.total)}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-800">{ord.tipoSuministro}</td>
                      <td className="px-4 py-3">
                        <p className="font-mono-tabular font-bold text-[#2A7CFA]">
                          Fase {ord.faseActual}/7
                        </p>
                        <p className="text-neutral-700">{ord.estatus}</p>
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

  // ventas_po
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black">
          Portales de Órdenes de Compra (PO)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Recepción, validación de existencias y conversión de POs masivas de cadenas comerciales
        </p>
      </div>

      {state.purchaseOrders.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-2">
          <Store className="h-8 w-8 mx-auto text-neutral-400" />
          <p className="text-sm font-bold text-black">Sin órdenes PO pendientes en portal</p>
          <p className="text-xs text-neutral-600">
            Las órdenes recibidas vía EDI / portal de cadenas aparecerán aquí para validación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.purchaseOrders.map((po) => (
            <div
              key={po.id}
              className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-bold text-[#1E2EB9]">{po.poNumero}</span>
                  <span className="font-mono-tabular text-neutral-600">
                    Límite: {po.fechaEntregaLimite}
                  </span>
                </div>
                <h3 className="mt-1.5 text-base font-bold text-black">{po.cadena}</h3>
                <p className="mt-1 text-xs text-neutral-700">
                  {po.productoNombre} ·{' '}
                  <span className="font-mono-tabular font-semibold">
                    {formatNumber(po.cantidad)} piezas
                  </span>
                </p>
                <p className="mt-2 font-mono-tabular text-sm font-bold text-black">
                  Valor PO: {formatMXN(po.montoTotal)}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-black/10 pt-3">
                <span className="text-xs font-semibold text-neutral-700">
                  Estatus: {po.estatus}
                </span>

                {po.estatus !== 'En Proceso' ? (
                  <button
                    type="button"
                    onClick={() => validatePurchaseOrder(po.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A7CFA] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                  >
                    <span>Validar y Pasar a Diseño/OP</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#2A7CFA]">Convertida en Pedido</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
