export type RoleId = 'admin' | 'produccion' | 'ventas' | 'almacen' | 'taller';

export type ModuleId =
  // Admin
  | 'admin_dashboard'
  | 'admin_usuarios'
  | 'admin_finanzas'
  | 'admin_autorizaciones'
  // Producción
  | 'prod_ordenes'
  | 'prod_procesos'
  | 'prod_fichas'
  | 'prod_qa'
  // Ventas
  | 'ventas_catalogo'
  | 'ventas_clientes'
  | 'ventas_pedidos'
  | 'ventas_po'
  // Almacén
  | 'alm_materias'
  | 'alm_terminado'
  | 'alm_embarques'
  | 'alm_alertas'
  // Taller
  | 'taller_tareas'
  | 'taller_avance'
  | 'taller_incidencias';

export type WorkflowPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RoleDefinition {
  id: RoleId;
  name: string;
  shortLabel: string;
  modules: {
    id: ModuleId;
    label: string;
    shortLabel: string;
  }[];
}

export interface AppUser {
  id: string;
  nombre: string;
  correo: string;
  rol: RoleId;
  departamento: string;
  activo: boolean;
  permisos: string[];
  ultimoAcceso: string;
}

export interface ClientAccount {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  rfc: string;
  tipo: 'Cadena Comercial' | 'Tienda Departamental' | 'Distribuidor Nacional';
  contacto: string;
  telefono: string;
  ciudad: string;
  limiteCredito: number;
  saldoPendiente: number;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  nombre: string;
  coleccion: string;
  temporada: string;
  categoria: 'Línea' | 'Temporada' | 'Colección Especial';
  precioMayoreo: number;
  precioMenudeo: number;
  tallas: string[];
  colores: string[];
  especificacionResumen: string;
}

export interface SalesOrder {
  id: string;
  folio: string;
  clienteId: string;
  clienteNombre: string;
  poReferencia?: string;
  productoId: string;
  productoNombre: string;
  sku: string;
  tallaResumen: string;
  color: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  tipoSuministro: 'Stock Existente' | 'Make-to-Order';
  faseActual: WorkflowPhase;
  estatus:
    | 'Validado Comercial'
    | 'En Diseño / Ficha'
    | 'Planeación e Insumos'
    | 'En Producción'
    | 'Inspección QA'
    | 'Listo para Embarque'
    | 'Entregado'
    | 'Facturado / Cerrado';
  fechaCreacion: string;
  fechaCompromiso: string;
}

export interface PurchaseOrder {
  id: string;
  poNumero: string;
  cadena: string;
  clienteId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  montoTotal: number;
  fechaRecepcion: string;
  fechaEntregaLimite: string;
  estatus: 'Recibida' | 'Validada' | 'En Proceso';
}

export interface TechSheet {
  id: string;
  codigo: string;
  pedidoId?: string;
  productoId: string;
  productoNombre: string;
  version: string;
  pantones: string[];
  matrizBordado: string;
  puntadasEstimadas: number;
  metodoEstampado: string;
  especificacionCostura: string;
  curvaTallas: string;
  materialesRequeridos: {
    materialId: string;
    materialNombre: string;
    cantidadPorUnidad: number;
    unidad: string;
  }[];
  estatus: 'Borrador' | 'Aprobada y Liberada';
  responsable: string;
  fechaActualizacion: string;
}

export type SpecialProcessType = 'Corte' | 'Bordado' | 'Estampado y Sublimado' | 'Confección Textil';

export interface ProductionOrder {
  id: string;
  opFolio: string;
  pedidoId: string;
  pedidoFolio: string;
  fichaTecnicaId: string;
  fichaCodigo: string;
  productoNombre: string;
  cantidadPlaneada: number;
  cantidadProducida: number;
  mermaUnidades: number;
  tipoLote: 'Línea' | 'Temporada';
  estacionActual: SpecialProcessType;
  maquinaOLinea: string;
  operadorAsignado: string;
  parametrosProceso: {
    puntadas?: number;
    catalogoDiseno?: string;
    temperaturaC?: number;
    tiempoCuradoSeg?: number;
    papelOTinta?: string;
    lineaCostura?: string;
    curvaCorte?: string;
  };
  insumosReservados: boolean;
  estatus: 'Calendarizada' | 'En Proceso' | 'Pausada' | 'Terminada Piso' | 'Liberada QA';
  fechaProgramada: string;
  checkInHora?: string;
  checkOutHora?: string;
}

export interface QAInspection {
  id: string;
  opId: string;
  opFolio: string;
  pedidoId: string;
  productoNombre: string;
  loteCantidad: number;
  muestraRevisada: number;
  defectosEncontrados: number;
  mermaPorcentaje: number;
  resultado: 'Pendiente' | 'Aprobado' | 'Con observaciones' | 'Rechazado';
  observaciones: string;
  inspector: string;
  fechaInspeccion: string;
}

export interface RawMaterial {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'Telas' | 'Hilos' | 'Tintas' | 'Sublimado' | 'Avíos';
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  proveedor: string;
  costoUnitario: number;
  ubicacion: string;
  requisicionActiva: boolean;
}

export interface FinishedGood {
  id: string;
  sku: string;
  modelo: string;
  talla: string;
  color: string;
  temporada: string;
  cantidadDisponible: number;
  ubicacionAlmacen: string;
  opOrigen?: string;
}

export interface Shipment {
  id: string;
  guia: string;
  packingList: string;
  pedidoId: string;
  pedidoFolio: string;
  destinoTienda: string;
  ciudad: string;
  transportista: string;
  unidades: number;
  bultos: number;
  estatus: 'Por Despachar' | 'En Ruta' | 'Acuse Confirmado';
  fechaSalida: string;
  acuseReciboFolio?: string;
  fechaAcuse?: string;
}

export interface CFDIInvoice {
  id: string;
  uuid: string;
  serieFolio: string;
  pedidoId: string;
  pedidoFolio: string;
  clienteNombre: string;
  rfcReceptor: string;
  usoCfdi: string;
  regimenFiscal: string;
  subtotal: number;
  iva: number;
  total: number;
  estatusPago: 'Por Cobrar' | 'Pagada';
  fechaEmision: string;
  fechaVencimiento: string;
}

export interface SpecialAuthorization {
  id: string;
  tipo: 'OC Alto Valor' | 'Descuento Mayorista' | 'Ajuste Inventario';
  titulo: string;
  solicitante: string;
  montoImpacto: number;
  detalle: string;
  estatus: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fechaSolicitud: string;
}

export interface WorkshopIncident {
  id: string;
  opFolio: string;
  estacion: SpecialProcessType;
  tipo: 'Falla de Maquinaria' | 'Falta de Insumos' | 'Defecto en Lote de Tela';
  severidad: 'Alta' | 'Media' | 'Baja';
  descripcion: string;
  reportadoPor: string;
  estatus: 'Abierta' | 'Resuelta';
  fechaReporte: string;
}

export interface WorkshopCycleLog {
  id: string;
  opId: string;
  opFolio: string;
  estacion: SpecialProcessType;
  operador: string;
  horaInicio: string;
  horaFin?: string;
  duracionMinutos?: number;
  unidadesCompletadas: number;
  mermaReportada: number;
}

export interface ERPState {
  users: AppUser[];
  clients: ClientAccount[];
  catalog: CatalogProduct[];
  orders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  techSheets: TechSheet[];
  productionOrders: ProductionOrder[];
  qaInspections: QAInspection[];
  rawMaterials: RawMaterial[];
  finishedGoods: FinishedGood[];
  shipments: Shipment[];
  invoices: CFDIInvoice[];
  authorizations: SpecialAuthorization[];
  incidents: WorkshopIncident[];
  cycleLogs: WorkshopCycleLog[];
}
