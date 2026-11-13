import React, { useState } from 'react';
import { AlertTriangle, Boxes, CheckCircle2, Package, Plus, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ModuleId, RawMaterial } from '../../types/erp';
import { formatMXN, formatNumber } from '../../utils/format';

interface WarehouseModulesProps {
  activeModule: ModuleId;
}

export const WarehouseModules: React.FC<WarehouseModulesProps> = ({ activeModule }) => {
  const { state, addRawMaterial, restockRawMaterial, requestMaterialPurchase, dispatchShipment, confirmDeliveryReceipt } =
    useStore();

  const [showMatForm, setShowMatForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<RawMaterial['categoria']>('Telas');
  const [unidad, setUnidad] = useState('metros');
  const [stockActual, setStockActual] = useState(500);
  const [stockMinimo, setStockMinimo] = useState(150);
  const [proveedor, setProveedor] = useState('Proveedor Nacional Textil');
  const [costoUnitario, setCostoUnitario] = useState(75);
  const [ubicacion, setUbicacion] = useState('Rack A-02');

  const [carrierInputs, setCarrierInputs] = useState<Record<string, string>>({});
  const [acuseInputs, setAcuseInputs] = useState<Record<string, string>>({});

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) return;
    addRawMaterial({
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      categoria,
      unidad,
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      proveedor,
      costoUnitario: Number(costoUnitario),
      ubicacion,
    });
    setCodigo('');
    setNombre('');
    setShowMatForm(false);
  };

  if (activeModule === 'alm_materias') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black">
              Control de Materias Primas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Inventario de rollos de tela, hilos, tintas, insumos de sublimado y avíos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMatForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Alta de Insumo</span>
          </button>
        </div>

        {showMatForm && (
          <form
            onSubmit={handleAddMaterial}
            className="rounded-xl border border-black/10 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Código</label>
              <input
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="TEL-ALG-200"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Descripción</label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Rollo Gabardina 260g"
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as RawMaterial['categoria'])}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"
              >
                <option value="Telas">Telas</option>
                <option value="Hilos">Hilos</option>
                <option value="Tintas">Tintas</option>
                <option value="Sublimado">Sublimado</option>
                <option value="Avíos">Avíos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Unidad</label>
              <input
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Stock Inicial</label>
              <input
                type="number"
                value={stockActual}
                onChange={(e) => setStockActual(Number(e.target.value))}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Stock Mínimo</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Number(e.target.value))}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Ubicación</label>
              <input
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Guardar Material
              </button>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.rawMaterials.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Boxes className="h-8 w-8 mx-auto text-neutral-400" />
              <p className="text-sm font-bold text-black">Inventario de materias primas vacío</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Material / Código</th>
                    <th className="px-4 py-3 font-bold">Categoría</th>
                    <th className="px-4 py-3 font-bold text-right">Existencia</th>
                    <th className="px-4 py-3 font-bold text-right">Mínimo</th>
                    <th className="px-4 py-3 font-bold">Ubicación / Proveedor</th>
                    <th className="px-4 py-3 font-bold text-right">Reabasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.rawMaterials.map((mat) => {
                    const isLow = mat.stockActual <= mat.stockMinimo;
                    return (
                      <tr key={mat.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <p className="font-bold text-black">{mat.nombre}</p>
                          <p className="font-mono-tabular text-[11px] text-[#1E2EB9]">{mat.codigo}</p>
                        </td>
                        <td className="px-4 py-3 text-neutral-800">{mat.categoria}</td>
                        <td className="px-4 py-3 text-right font-mono-tabular font-bold">
                          <span className={isLow ? 'text-[#E76108]' : 'text-black'}>
                            {formatNumber(mat.stockActual)} {mat.unidad}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono-tabular text-neutral-600">
                          {formatNumber(mat.stockMinimo)} {mat.unidad}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {mat.ubicacion} · {mat.proveedor}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => restockRawMaterial(mat.id, 100)}
                            className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:border-[#2A7CFA] hover:text-[#2A7CFA] cursor-pointer"
                          >
                            +100 {mat.unidad}
                          </button>
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

  if (activeModule === 'alm_terminado') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black">
            Inventario de Producto Terminado
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Prendas liberadas por Control de Calidad clasificadas por modelo, talla, color y temporada
          </p>
        </div>

        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {state.finishedGoods.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Package className="h-8 w-8 mx-auto text-neutral-400" />
              <p className="text-sm font-bold text-black">Sin existencias en Producto Terminado</p>
              <p className="text-xs text-neutral-600">
                Los lotes aprobados en Control de Calidad (QA) ingresan aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 bg-[#F8FAFC] text-neutral-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">SKU / Modelo</th>
                    <th className="px-4 py-3 font-bold">Talla y Color</th>
                    <th className="px-4 py-3 font-bold">Temporada</th>
                    <th className="px-4 py-3 font-bold">Ubicación / Origen</th>
                    <th className="px-4 py-3 font-bold text-right">Disponibles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {state.finishedGoods.map((fg) => (
                    <tr key={fg.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <p className="font-bold text-black">{fg.modelo}</p>
                        <p className="font-mono-tabular text-[11px] text-[#1E2EB9]">{fg.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-800">
                        Talla <strong>{fg.talla}</strong> · {fg.color}
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{fg.temporada}</td>
                      <td className="px-4 py-3 text-neutral-700">
                        {fg.ubicacionAlmacen} · {fg.opOrigen || 'Stock base'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular text-sm font-bold text-[#2A7CFA]">
                        {formatNumber(fg.cantidadDisponible)} uds
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

  if (activeModule === 'alm_embarques') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black">
            Entregas y Embarques — Fase 6
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Rutas de distribución, packing lists, guías de envío y acuse de recibo para facturación
          </p>
        </div>

        {state.shipments.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-2">
            <Truck className="h-8 w-8 mx-auto text-neutral-400" />
            <p className="text-sm font-bold text-black">Sin embarques programados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.shipments.map((emb) => (
              <div
                key={emb.id}
                className="rounded-xl border border-black/10 bg-white p-5 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular font-bold text-[#1E2EB9]">{emb.guia}</span>
                  <span
                    className={`font-bold ${
                      emb.estatus === 'Acuse Confirmado'
                        ? 'text-[#2A7CFA]'
                        : emb.estatus === 'En Ruta'
                        ? 'text-[#E9BD02]'
                        : 'text-[#E76108]'
                    }`}
                  >
                    {emb.estatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-black">{emb.destinoTienda}</h3>
                  <p className="text-neutral-600">
                    {emb.ciudad} · Pedido {emb.pedidoFolio} · Packing List{' '}
                    <span className="font-mono-tabular">{emb.packingList}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 font-mono-tabular text-neutral-800">
                  <span>{formatNumber(emb.unidades)} prendas</span>
                  <span aria-hidden="true">·</span>
                  <span>{emb.bultos} bultos</span>
                  <span aria-hidden="true">·</span>
                  <span>{emb.transportista}</span>
                </div>

                {emb.estatus === 'Por Despachar' && (
                  <div className="flex flex-wrap gap-2 border-t border-black/10 pt-3">
                    <input
                      value={carrierInputs[emb.id] ?? emb.transportista}
                      onChange={(e) =>
                        setCarrierInputs((prev) => ({ ...prev, [emb.id]: e.target.value }))
                      }
                      placeholder="Unidad / Transportista"
                      className="flex-1 min-w-[160px] rounded-lg border border-black/15 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dispatchShipment(emb.id, carrierInputs[emb.id] || emb.transportista)
                      }
                      className="rounded-lg bg-[#2A7CFA] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                    >
                      Despachar Ruta
                    </button>
                  </div>
                )}

                {emb.estatus === 'En Ruta' && (
                  <div className="flex flex-wrap gap-2 border-t border-black/10 pt-3">
                    <input
                      value={acuseInputs[emb.id] ?? ''}
                      onChange={(e) =>
                        setAcuseInputs((prev) => ({ ...prev, [emb.id]: e.target.value }))
                      }
                      placeholder="Folio Acuse Tienda (ej. ACU-4012)"
                      className="flex-1 min-w-[160px] rounded-lg border border-black/15 px-3 py-1.5 text-xs font-mono-tabular"
                    />
                    <button
                      type="button"
                      onClick={() => confirmDeliveryReceipt(emb.id, acuseInputs[emb.id] || '')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E2EB9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2A7CFA] cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirmar Acuse (Habilita CFDI)</span>
                    </button>
                  </div>
                )}

                {emb.estatus === 'Acuse Confirmado' && (
                  <p className="border-t border-black/10 pt-3 text-xs font-semibold text-[#2A7CFA]">
                    Acuse registrado: <span className="font-mono-tabular">{emb.acuseReciboFolio}</span>{' '}
                    ({emb.fechaAcuse}) · Listo para Facturación (Fase 7)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // alm_alertas
  const lowMaterials = state.rawMaterials.filter((m) => m.stockActual <= m.stockMinimo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black">
          Alertas de Stock Mínimo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Reabastecimiento oportuno de materiales críticos para evitar paros en línea de producción
        </p>
      </div>

      {lowMaterials.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 mx-auto text-[#2A7CFA]" />
          <p className="text-sm font-bold text-black">Niveles de abastecimiento óptimos</p>
          <p className="text-xs text-neutral-600">
            Todas las materias primas están por encima de su punto de reorden.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowMaterials.map((mat) => {
            const deficit = Math.max(0, mat.stockMinimo * 2 - mat.stockActual);
            return (
              <div
                key={mat.id}
                className="rounded-xl border border-[#E76108]/40 bg-white p-5 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#E76108]">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Stock Crítico</span>
                  </span>
                  <span className="font-mono-tabular text-neutral-600">{mat.codigo}</span>
                </div>

                <h3 className="text-base font-bold text-black">{mat.nombre}</h3>

                <div className="grid grid-cols-3 gap-2 font-mono-tabular bg-[#F8FAFC] p-3 rounded-lg border border-black/10">
                  <div>
                    <span className="block text-neutral-600">Actual</span>
                    <span className="text-sm font-bold text-[#E76108]">
                      {mat.stockActual} {mat.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="block text-neutral-600">Mínimo</span>
                    <span className="text-sm font-bold text-black">
                      {mat.stockMinimo} {mat.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="block text-neutral-600">Sugerido</span>
                    <span className="text-sm font-bold text-[#1E2EB9]">
                      {formatMXN(deficit * mat.costoUnitario)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-neutral-700">Proveedor: {mat.proveedor}</span>
                  <div className="flex gap-2">
                    {!mat.requisicionActiva ? (
                      <button
                        type="button"
                        onClick={() => requestMaterialPurchase(mat.id)}
                        className="rounded-lg bg-[#E76108] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                      >
                        Generar Requisición
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => restockRawMaterial(mat.id, Math.max(100, deficit))}
                        className="rounded-lg bg-[#2A7CFA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E2EB9] cursor-pointer"
                      >
                        Registrar Recepción de Compra
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
