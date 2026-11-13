import React, { createContext, useContext, useEffect, useState } from 'react';
import { EMPTY_ERP_STATE, INITIAL_SAMPLE_STATE } from '../data/initialData';
import {
  clearSupabaseSampleData,
  SupabaseClearResult,
} from '../services/supabaseClient';
import {
  AppUser,
  CatalogProduct,
  ClientAccount,
  ERPState,
  ProductionOrder,
  QAInspection,
  RawMaterial,
  RoleId,
  SalesOrder,
  SpecialProcessType,
  TechSheet,
  WorkshopIncident,
} from '../types/erp';

const STORAGE_STATE_KEY = 'gw_erp_state_v1';
const STORAGE_CLEARED_KEY = 'gw_sample_cleared_v1';

interface ClearDataReport {
  localCleared: boolean;
  supabaseResult: SupabaseClearResult;
  timestamp: string;
}

interface StoreContextValue {
  state: ERPState;
  isSampleCleared: boolean;
  lastClearReport: ClearDataReport | null;
  clearAllSampleData: () => Promise<ClearDataReport>;
  restoreSampleData: () => void;
  // Fase 1: Comercial
  createSalesOrder: (input: {
    clienteId: string;
    productoId: string;
    tallaResumen: string;
    color: string;
    cantidad: number;
    fechaCompromiso: string;
    poReferencia?: string;
  }) => SalesOrder | null;
  validatePurchaseOrder: (poId: string) => void;
  // Fase 2: Diseño y Fichas Técnicas
  createOrApproveTechSheet: (input: {
    pedidoId?: string;
    productoId: string;
    pantones: string[];
    matrizBordado: string;
    puntadasEstimadas: number;
    metodoEstampado: string;
    especificacionCostura: string;
    curvaTallas: string;
    aprobarAhora: boolean;
  }) => void;
  approveExistingTechSheet: (techSheetId: string) => void;
  // Fase 3: Planeación y Abastecimiento
  scheduleProductionOrder: (input: {
    pedidoId: string;
    fichaTecnicaId: string;
    tipoLote: 'Línea' | 'Temporada';
    estacionInicial: SpecialProcessType;
    maquinaOLinea: string;
    operadorAsignado: string;
    fechaProgramada: string;
  }) => { ok: boolean; shortageMessage?: string };
  restockRawMaterial: (materialId: string, cantidadAgregar: number) => void;
  requestMaterialPurchase: (materialId: string) => void;
  addRawMaterial: (input: Omit<RawMaterial, 'id' | 'requisicionActiva'>) => void;
  // Fase 4: Piso de Taller y Procesos Especiales
  advanceProcessStation: (opId: string, nuevaEstacion: SpecialProcessType, maquinaOLinea: string) => void;
  checkInProductionOrder: (opId: string, operador: string) => void;
  checkOutProductionOrder: (
    opId: string,
    unidadesTerminadas: number,
    mermaUnidades: number,
    operador: string
  ) => void;
  reportWorkshopIncident: (input: {
    opFolio: string;
    estacion: SpecialProcessType;
    tipo: WorkshopIncident['tipo'];
    severidad: WorkshopIncident['severidad'];
    descripcion: string;
    reportadoPor: string;
  }) => void;
  resolveWorkshopIncident: (incidentId: string) => void;
  // Fase 5: Control de Calidad QA
  submitQAInspection: (input: {
    qaId: string;
    muestraRevisada: number;
    defectosEncontrados: number;
    resultado: 'Aprobado' | 'Con observaciones' | 'Rechazado';
    observaciones: string;
    inspector: string;
  }) => void;
  // Fase 6: Almacén, Logística y Embarques
  dispatchShipment: (shipmentId: string, transportista: string) => void;
  confirmDeliveryReceipt: (shipmentId: string, acuseFolio: string) => void;
  // Fase 7: Facturación CFDI 4.0 y Dirección
  emitCFDIInvoice: (pedidoId: string, usoCfdi: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
  resolveAuthorization: (authId: string, decision: 'Aprobada' | 'Rechazada') => void;
  // Catálogos / CRM / Usuarios
  addUser: (input: { nombre: string; correo: string; rol: RoleId; departamento: string }) => void;
  toggleUserActive: (userId: string) => void;
  deleteUser: (userId: string) => void;
  addClient: (input: Omit<ClientAccount, 'id' | 'saldoPendiente'>) => void;
  addCatalogProduct: (input: Omit<CatalogProduct, 'id'>) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function loadInitialState(): { state: ERPState; cleared: boolean } {
  if (typeof window === 'undefined') {
    return { state: INITIAL_SAMPLE_STATE, cleared: false };
  }

  const clearedFlag = window.localStorage.getItem(STORAGE_CLEARED_KEY) === 'true';
  const savedRaw = window.localStorage.getItem(STORAGE_STATE_KEY);

  if (savedRaw) {
    try {
      const parsed = JSON.parse(savedRaw) as ERPState;
      return { state: parsed, cleared: clearedFlag };
    } catch {
      // ignore corrupted storage
    }
  }

  if (clearedFlag) {
    return { state: EMPTY_ERP_STATE, cleared: true };
  }

  return { state: INITIAL_SAMPLE_STATE, cleared: false };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentTimeHHMM(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialState();
  const [state, setState] = useState<ERPState>(initial.state);
  const [isSampleCleared, setIsSampleCleared] = useState<boolean>(initial.cleared);
  const [lastClearReport, setLastClearReport] = useState<ClearDataReport | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const clearAllSampleData = async (): Promise<ClearDataReport> => {
    window.localStorage.setItem(STORAGE_CLEARED_KEY, 'true');
    window.localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(EMPTY_ERP_STATE));
    setIsSampleCleared(true);
    setState(EMPTY_ERP_STATE);

    const supabaseResult = await clearSupabaseSampleData();
    const report: ClearDataReport = {
      localCleared: true,
      supabaseResult,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    setLastClearReport(report);
    return report;
  };

  const restoreSampleData = () => {
    window.localStorage.setItem(STORAGE_CLEARED_KEY, 'false');
    window.localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(INITIAL_SAMPLE_STATE));
    setIsSampleCleared(false);
    setState(INITIAL_SAMPLE_STATE);
    setLastClearReport(null);
  };

  const createSalesOrder: StoreContextValue['createSalesOrder'] = (input) => {
    const client = state.clients.find((c) => c.id === input.clienteId);
    const product = state.catalog.find((p) => p.id === input.productoId);
    if (!client || !product || input.cantidad <= 0) return null;

    // Validate Finished Goods Stock
    const availableStock = state.finishedGoods
      .filter((fg) => fg.sku === product.sku)
      .reduce((sum, fg) => sum + fg.cantidadDisponible, 0);

    const isStockAvailable = availableStock >= input.cantidad;
    const folioNum = 105 + state.orders.length;
    const newOrderId = `PED-${Date.now()}`;
    const newOrder: SalesOrder = {
      id: newOrderId,
      folio: `PED-2026-${folioNum}`,
      clienteId: client.id,
      clienteNombre: client.nombreComercial,
      poReferencia: input.poReferencia,
      productoId: product.id,
      productoNombre: product.nombre,
      sku: product.sku,
      tallaResumen: input.tallaResumen || 'M(50%) G(50%)',
      color: input.color || product.colores[0] || 'Único',
      cantidad: input.cantidad,
      precioUnitario: product.precioMayoreo,
      total: input.cantidad * product.precioMayoreo,
      tipoSuministro: isStockAvailable ? 'Stock Existente' : 'Make-to-Order',
      faseActual: isStockAvailable ? 6 : 2,
      estatus: isStockAvailable ? 'Listo para Embarque' : 'En Diseño / Ficha',
      fechaCreacion: todayISO(),
      fechaCompromiso: input.fechaCompromiso,
    };

    setState((prev) => {
      let updatedFinished = [...prev.finishedGoods];
      let updatedShipments = [...prev.shipments];

      if (isStockAvailable) {
        let remaining = input.cantidad;
        updatedFinished = updatedFinished.map((fg) => {
          if (fg.sku === product.sku && remaining > 0 && fg.cantidadDisponible > 0) {
            const take = Math.min(fg.cantidadDisponible, remaining);
            remaining -= take;
            return { ...fg, cantidadDisponible: fg.cantidadDisponible - take };
          }
          return fg;
        });

        updatedShipments = [
          {
            id: `EMB-${Date.now()}`,
            guia: `GW-GUIA-${Math.floor(90500 + Math.random() * 900)}`,
            packingList: `PL-${client.nombreComercial.slice(0, 3).toUpperCase()}-${folioNum}`,
            pedidoId: newOrder.id,
            pedidoFolio: newOrder.folio,
            destinoTienda: client.nombreComercial,
            ciudad: client.ciudad,
            transportista: 'Por asignar unidad',
            unidades: input.cantidad,
            bultos: Math.max(1, Math.ceil(input.cantidad / 25)),
            estatus: 'Por Despachar',
            fechaSalida: todayISO(),
          },
          ...updatedShipments,
        ];
      }

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        finishedGoods: updatedFinished,
        shipments: updatedShipments,
      };
    });

    return newOrder;
  };

  const validatePurchaseOrder = (poId: string) => {
    const po = state.purchaseOrders.find((item) => item.id === poId);
    if (!po || po.estatus === 'En Proceso') return;

    const order = createSalesOrder({
      clienteId: po.clienteId,
      productoId: po.productoId,
      tallaResumen: 'Curva Estándar Cadena (CH/M/G/EG)',
      color: 'Según PO',
      cantidad: po.cantidad,
      fechaCompromiso: po.fechaEntregaLimite,
      poReferencia: po.poNumero,
    });

    if (!order) return;

    setState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((item) =>
        item.id === poId ? { ...item, estatus: 'En Proceso' } : item
      ),
    }));
  };

  const createOrApproveTechSheet: StoreContextValue['createOrApproveTechSheet'] = (input) => {
    const product = state.catalog.find((p) => p.id === input.productoId);
    if (!product) return;

    const defaultMaterials = state.rawMaterials.slice(0, 2).map((mat) => ({
      materialId: mat.id,
      materialNombre: mat.nombre,
      cantidadPorUnidad: mat.categoria === 'Telas' ? 1.2 : 0.05,
      unidad: mat.unidad,
    }));

    const newSheet: TechSheet = {
      id: `FT-${Date.now()}`,
      codigo: `FT-${product.sku}-${state.techSheets.length + 1}`,
      pedidoId: input.pedidoId,
      productoId: product.id,
      productoNombre: product.nombre,
      version: 'v1.0',
      pantones: input.pantones.length > 0 ? input.pantones : ['Pantone 2728 C'],
      matrizBordado: input.matrizBordado || 'Sin bordado',
      puntadasEstimadas: input.puntadasEstimadas || 0,
      metodoEstampado: input.metodoEstampado || 'Estándar',
      especificacionCostura: input.especificacionCostura || 'Costura recta + overlock 4 hilos',
      curvaTallas: input.curvaTallas || 'CH 20% · M 35% · G 30% · EG 15%',
      materialesRequeridos: defaultMaterials,
      estatus: input.aprobarAhora ? 'Aprobada y Liberada' : 'Borrador',
      responsable: 'Gerencia de Producción',
      fechaActualizacion: todayISO(),
    };

    setState((prev) => ({
      ...prev,
      techSheets: [newSheet, ...prev.techSheets],
      orders:
        input.aprobarAhora && input.pedidoId
          ? prev.orders.map((ord) =>
              ord.id === input.pedidoId && ord.faseActual < 3
                ? { ...ord, faseActual: 3, estatus: 'Planeación e Insumos' }
                : ord
            )
          : prev.orders,
    }));
  };

  const approveExistingTechSheet = (techSheetId: string) => {
    const target = state.techSheets.find((f) => f.id === techSheetId);
    if (!target) return;

    setState((prev) => ({
      ...prev,
      techSheets: prev.techSheets.map((f) =>
        f.id === techSheetId
          ? { ...f, estatus: 'Aprobada y Liberada', fechaActualizacion: todayISO() }
          : f
      ),
      orders: target.pedidoId
        ? prev.orders.map((ord) =>
            ord.id === target.pedidoId && ord.faseActual < 3
              ? { ...ord, faseActual: 3, estatus: 'Planeación e Insumos' }
              : ord
          )
        : prev.orders,
    }));
  };

  const scheduleProductionOrder: StoreContextValue['scheduleProductionOrder'] = (input) => {
    const order = state.orders.find((o) => o.id === input.pedidoId);
    const sheet = state.techSheets.find((f) => f.id === input.fichaTecnicaId);
    if (!order || !sheet) {
      return { ok: false, shortageMessage: 'Selecciona un pedido y una ficha técnica válida.' };
    }

    // Check raw materials sufficiency
    const shortages: string[] = [];
    sheet.materialesRequeridos.forEach((req) => {
      const mat = state.rawMaterials.find((m) => m.id === req.materialId);
      const needed = Number((req.cantidadPorUnidad * order.cantidad).toFixed(2));
      if (mat && mat.stockActual < needed) {
        shortages.push(`${mat.nombre} (req: ${needed} ${mat.unidad}, disp: ${mat.stockActual})`);
      }
    });

    const opNum = 116 + state.productionOrders.length;
    const newOp: ProductionOrder = {
      id: `OP-${Date.now()}`,
      opFolio: `OP-2026-${opNum}`,
      pedidoId: order.id,
      pedidoFolio: order.folio,
      fichaTecnicaId: sheet.id,
      fichaCodigo: sheet.codigo,
      productoNombre: order.productoNombre,
      cantidadPlaneada: order.cantidad,
      cantidadProducida: 0,
      mermaUnidades: 0,
      tipoLote: input.tipoLote,
      estacionActual: input.estacionInicial,
      maquinaOLinea: input.maquinaOLinea,
      operadorAsignado: input.operadorAsignado,
      parametrosProceso: {
        puntadas: sheet.puntadasEstimadas,
        catalogoDiseno: sheet.matrizBordado,
        temperaturaC: input.estacionInicial === 'Estampado y Sublimado' ? 205 : undefined,
        tiempoCuradoSeg: input.estacionInicial === 'Estampado y Sublimado' ? 40 : undefined,
        lineaCostura: input.maquinaOLinea,
        curvaCorte: order.tallaResumen,
      },
      insumosReservados: shortages.length === 0,
      estatus: 'Calendarizada',
      fechaProgramada: input.fechaProgramada || todayISO(),
    };

    setState((prev) => ({
      ...prev,
      productionOrders: [newOp, ...prev.productionOrders],
      rawMaterials: prev.rawMaterials.map((mat) => {
        const req = sheet.materialesRequeridos.find((r) => r.materialId === mat.id);
        if (!req) return mat;
        const needed = Number((req.cantidadPorUnidad * order.cantidad).toFixed(1));
        const nextStock = Math.max(0, Number((mat.stockActual - needed).toFixed(1)));
        return {
          ...mat,
          stockActual: nextStock,
          requisicionActiva: nextStock <= mat.stockMinimo ? true : mat.requisicionActiva,
        };
      }),
      orders: prev.orders.map((ord) =>
        ord.id === order.id
          ? { ...ord, faseActual: 4, estatus: 'En Producción' }
          : ord
      ),
    }));

    return {
      ok: true,
      shortageMessage:
        shortages.length > 0
          ? `OP creada con alerta de abastecimiento: ${shortages.join('; ')}`
          : undefined,
    };
  };

  const restockRawMaterial = (materialId: string, cantidadAgregar: number) => {
    if (cantidadAgregar <= 0) return;
    setState((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((mat) => {
        if (mat.id !== materialId) return mat;
        const nextStock = Number((mat.stockActual + cantidadAgregar).toFixed(1));
        return {
          ...mat,
          stockActual: nextStock,
          requisicionActiva: nextStock <= mat.stockMinimo,
        };
      }),
    }));
  };

  const requestMaterialPurchase = (materialId: string) => {
    setState((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((mat) =>
        mat.id === materialId ? { ...mat, requisicionActiva: true } : mat
      ),
    }));
  };

  const addRawMaterial: StoreContextValue['addRawMaterial'] = (input) => {
    const newMat: RawMaterial = {
      ...input,
      id: `MAT-${Date.now()}`,
      requisicionActiva: input.stockActual <= input.stockMinimo,
    };
    setState((prev) => ({ ...prev, rawMaterials: [newMat, ...prev.rawMaterials] }));
  };

  const advanceProcessStation = (
    opId: string,
    nuevaEstacion: SpecialProcessType,
    maquinaOLinea: string
  ) => {
    setState((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.map((op) =>
        op.id === opId
          ? {
              ...op,
              estacionActual: nuevaEstacion,
              maquinaOLinea,
              estatus: op.estatus === 'Calendarizada' ? 'En Proceso' : op.estatus,
            }
          : op
      ),
    }));
  };

  const checkInProductionOrder = (opId: string, operador: string) => {
    const hora = currentTimeHHMM();
    setState((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.map((op) =>
        op.id === opId
          ? {
              ...op,
              estatus: 'En Proceso',
              checkInHora: hora,
              operadorAsignado: operador || op.operadorAsignado,
            }
          : op
      ),
    }));
  };

  const checkOutProductionOrder = (
    opId: string,
    unidadesTerminadas: number,
    mermaUnidades: number,
    operador: string
  ) => {
    const op = state.productionOrders.find((item) => item.id === opId);
    if (!op) return;
    const horaFin = currentTimeHHMM();
    const totalProducido = op.cantidadProducida + unidadesTerminadas;
    const totalMerma = op.mermaUnidades + mermaUnidades;
    const batchComplete = totalProducido >= op.cantidadPlaneada;

    const newQA: QAInspection | null = batchComplete
      ? {
          id: `QA-${Date.now()}`,
          opId: op.id,
          opFolio: op.opFolio,
          pedidoId: op.pedidoId,
          productoNombre: op.productoNombre,
          loteCantidad: totalProducido,
          muestraRevisada: Math.max(10, Math.round(totalProducido * 0.15)),
          defectosEncontrados: totalMerma,
          mermaPorcentaje: Number(((totalMerma / Math.max(1, totalProducido)) * 100).toFixed(2)),
          resultado: 'Pendiente',
          observaciones: 'Lote terminado en piso de taller, listo para inspección QA.',
          inspector: 'Por asignar',
          fechaInspeccion: todayISO(),
        }
      : null;

    setState((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.map((item) =>
        item.id === opId
          ? {
              ...item,
              cantidadProducida: totalProducido,
              mermaUnidades: totalMerma,
              checkOutHora: horaFin,
              estatus: batchComplete ? 'Terminada Piso' : 'En Proceso',
            }
          : item
      ),
      cycleLogs: [
        {
          id: `CYC-${Date.now()}`,
          opId: op.id,
          opFolio: op.opFolio,
          estacion: op.estacionActual,
          operador: operador || op.operadorAsignado,
          horaInicio: op.checkInHora || horaFin,
          horaFin,
          duracionMinutos: 45,
          unidadesCompletadas: unidadesTerminadas,
          mermaReportada: mermaUnidades,
        },
        ...prev.cycleLogs,
      ],
      qaInspections: newQA ? [newQA, ...prev.qaInspections] : prev.qaInspections,
      orders: batchComplete
        ? prev.orders.map((ord) =>
            ord.id === op.pedidoId
              ? { ...ord, faseActual: 5, estatus: 'Inspección QA' }
              : ord
          )
        : prev.orders,
    }));
  };

  const reportWorkshopIncident: StoreContextValue['reportWorkshopIncident'] = (input) => {
    setState((prev) => ({
      ...prev,
      incidents: [
        {
          id: `INC-${Date.now()}`,
          ...input,
          estatus: 'Abierta',
          fechaReporte: `${todayISO()} ${currentTimeHHMM()}`,
        },
        ...prev.incidents,
      ],
    }));
  };

  const resolveWorkshopIncident = (incidentId: string) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, estatus: 'Resuelta' } : inc
      ),
    }));
  };

  const submitQAInspection: StoreContextValue['submitQAInspection'] = (input) => {
    const qa = state.qaInspections.find((item) => item.id === input.qaId);
    if (!qa) return;

    const mermaPct = Number(
      ((input.defectosEncontrados / Math.max(1, input.muestraRevisada)) * 100).toFixed(2)
    );
    const linkedOrder = state.orders.find((o) => o.id === qa.pedidoId);

    setState((prev) => {
      const updatedQA = prev.qaInspections.map((item) =>
        item.id === input.qaId
          ? {
              ...item,
              muestraRevisada: input.muestraRevisada,
              defectosEncontrados: input.defectosEncontrados,
              mermaPorcentaje: mermaPct,
              resultado: input.resultado,
              observaciones: input.observaciones,
              inspector: input.inspector,
              fechaInspeccion: todayISO(),
            }
          : item
      );

      let updatedFinished = [...prev.finishedGoods];
      let updatedShipments = [...prev.shipments];
      let updatedOrders = [...prev.orders];
      let updatedOps = [...prev.productionOrders];

      if (input.resultado === 'Aprobado') {
        updatedOps = updatedOps.map((op) =>
          op.id === qa.opId ? { ...op, estatus: 'Liberada QA' } : op
        );
        updatedFinished = [
          {
            id: `PT-${Date.now()}`,
            sku: linkedOrder?.sku || 'GW-LOT',
            modelo: qa.productoNombre,
            talla: linkedOrder?.tallaResumen || 'Surtida',
            color: linkedOrder?.color || 'Estándar',
            temporada: '2026',
            cantidadDisponible: qa.loteCantidad,
            ubicacionAlmacen: 'Pasillo PT-Liberado',
            opOrigen: qa.opFolio,
          },
          ...updatedFinished,
        ];
        if (linkedOrder) {
          updatedOrders = updatedOrders.map((ord) =>
            ord.id === linkedOrder.id
              ? { ...ord, faseActual: 6, estatus: 'Listo para Embarque' }
              : ord
          );
          const alreadyHasShipment = updatedShipments.some(
            (s) => s.pedidoId === linkedOrder.id
          );
          if (!alreadyHasShipment) {
            updatedShipments = [
              {
                id: `EMB-${Date.now()}`,
                guia: `GW-GUIA-${Math.floor(90600 + Math.random() * 350)}`,
                packingList: `PL-${linkedOrder.folio}`,
                pedidoId: linkedOrder.id,
                pedidoFolio: linkedOrder.folio,
                destinoTienda: linkedOrder.clienteNombre,
                ciudad: 'CEDIS Nacional',
                transportista: 'Por asignar transporte',
                unidades: qa.loteCantidad,
                bultos: Math.max(1, Math.ceil(qa.loteCantidad / 25)),
                estatus: 'Por Despachar',
                fechaSalida: todayISO(),
              },
              ...updatedShipments,
            ];
          }
        }
      } else if (input.resultado === 'Con observaciones') {
        updatedOps = updatedOps.map((op) =>
          op.id === qa.opId ? { ...op, estatus: 'En Proceso' } : op
        );
        if (linkedOrder) {
          updatedOrders = updatedOrders.map((ord) =>
            ord.id === linkedOrder.id
              ? { ...ord, faseActual: 4, estatus: 'En Producción' }
              : ord
          );
        }
      }

      return {
        ...prev,
        qaInspections: updatedQA,
        finishedGoods: updatedFinished,
        shipments: updatedShipments,
        orders: updatedOrders,
        productionOrders: updatedOps,
      };
    });
  };

  const dispatchShipment = (shipmentId: string, transportista: string) => {
    setState((prev) => ({
      ...prev,
      shipments: prev.shipments.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              estatus: 'En Ruta',
              transportista: transportista || s.transportista,
              fechaSalida: todayISO(),
            }
          : s
      ),
    }));
  };

  const confirmDeliveryReceipt = (shipmentId: string, acuseFolio: string) => {
    const shipment = state.shipments.find((s) => s.id === shipmentId);
    if (!shipment) return;

    setState((prev) => ({
      ...prev,
      shipments: prev.shipments.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              estatus: 'Acuse Confirmado',
              acuseReciboFolio: acuseFolio || `ACU-${Date.now().toString().slice(-5)}`,
              fechaAcuse: todayISO(),
            }
          : s
      ),
      orders: prev.orders.map((ord) =>
        ord.id === shipment.pedidoId
          ? { ...ord, faseActual: 7, estatus: 'Entregado' }
          : ord
      ),
    }));
  };

  const emitCFDIInvoice = (pedidoId: string, usoCfdi: string) => {
    const order = state.orders.find((o) => o.id === pedidoId);
    if (!order) return;
    const client = state.clients.find((c) => c.id === order.clienteId);
    const subtotal = order.total;
    const iva = Math.round(subtotal * 0.16);
    const total = subtotal + iva;
    const folioNum = 4821 + state.invoices.length;
    const uuid = `${Math.random().toString(16).slice(2, 10).toUpperCase()}-4C1E-4D88-9F12-${Math.random()
      .toString(16)
      .slice(2, 14)
      .toUpperCase()}`;

    setState((prev) => ({
      ...prev,
      invoices: [
        {
          id: `FAC-${Date.now()}`,
          uuid,
          serieFolio: `GW-A ${folioNum}`,
          pedidoId: order.id,
          pedidoFolio: order.folio,
          clienteNombre: order.clienteNombre,
          rfcReceptor: client?.rfc || 'XAXX010101000',
          usoCfdi: usoCfdi || 'G01 - Adquisición de mercancías',
          regimenFiscal: '601 - General de Ley Personas Morales',
          subtotal,
          iva,
          total,
          estatusPago: 'Por Cobrar',
          fechaEmision: todayISO(),
          fechaVencimiento: todayISO(),
        },
        ...prev.invoices,
      ],
      orders: prev.orders.map((ord) =>
        ord.id === pedidoId
          ? { ...ord, faseActual: 7, estatus: 'Facturado / Cerrado' }
          : ord
      ),
      clients: prev.clients.map((c) =>
        c.id === order.clienteId
          ? { ...c, saldoPendiente: c.saldoPendiente + total }
          : c
      ),
    }));
  };

  const markInvoicePaid = (invoiceId: string) => {
    const inv = state.invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.estatusPago === 'Pagada') return;

    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((item) =>
        item.id === invoiceId ? { ...item, estatusPago: 'Pagada' } : item
      ),
      clients: prev.clients.map((c) =>
        c.nombreComercial === inv.clienteNombre
          ? { ...c, saldoPendiente: Math.max(0, c.saldoPendiente - inv.total) }
          : c
      ),
    }));
  };

  const resolveAuthorization = (authId: string, decision: 'Aprobada' | 'Rechazada') => {
    setState((prev) => ({
      ...prev,
      authorizations: prev.authorizations.map((a) =>
        a.id === authId ? { ...a, estatus: decision } : a
      ),
    }));
  };

  const addUser: StoreContextValue['addUser'] = (input) => {
    const newUser: AppUser = {
      id: `USR-${Date.now()}`,
      nombre: input.nombre,
      correo: input.correo,
      rol: input.rol,
      departamento: input.departamento,
      activo: true,
      permisos: ['Acceso Operativo Estándar'],
      ultimoAcceso: 'Recién creado',
    };
    setState((prev) => ({ ...prev, users: [newUser, ...prev.users] }));
  };

  const toggleUserActive = (userId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, activo: !u.activo } : u)),
    }));
  };

  const deleteUser = (userId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== userId),
    }));
  };

  const addClient: StoreContextValue['addClient'] = (input) => {
    const newClient: ClientAccount = {
      ...input,
      id: `CLI-${Date.now()}`,
      saldoPendiente: 0,
    };
    setState((prev) => ({ ...prev, clients: [newClient, ...prev.clients] }));
  };

  const addCatalogProduct: StoreContextValue['addCatalogProduct'] = (input) => {
    const newProduct: CatalogProduct = {
      ...input,
      id: `CAT-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, catalog: [newProduct, ...prev.catalog] }));
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        isSampleCleared,
        lastClearReport,
        clearAllSampleData,
        restoreSampleData,
        createSalesOrder,
        validatePurchaseOrder,
        createOrApproveTechSheet,
        approveExistingTechSheet,
        scheduleProductionOrder,
        restockRawMaterial,
        requestMaterialPurchase,
        addRawMaterial,
        advanceProcessStation,
        checkInProductionOrder,
        checkOutProductionOrder,
        reportWorkshopIncident,
        resolveWorkshopIncident,
        submitQAInspection,
        dispatchShipment,
        confirmDeliveryReceipt,
        emitCFDIInvoice,
        markInvoicePaid,
        resolveAuthorization,
        addUser,
        toggleUserActive,
        deleteUser,
        addClient,
        addCatalogProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return ctx;
}
