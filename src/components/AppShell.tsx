import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cpu,
  Database,
  FileSpreadsheet,
  FileText,
  Layers,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { ModuleId, RoleId } from '../types/erp';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface AppShellProps {
  activeRole: RoleId;
  activeModule: ModuleId;
  onSelectModule: (moduleId: ModuleId) => void;
  onOpenDataModal: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const MODULE_ICONS: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  admin_dashboard: BarChart3,
  admin_usuarios: Users,
  admin_finanzas: Receipt,
  admin_autorizaciones: ShieldCheck,
  prod_ordenes: ClipboardList,
  prod_procesos: Cpu,
  prod_fichas: FileText,
  prod_qa: CheckCircle2,
  ventas_catalogo: ShoppingBag,
  ventas_clientes: Users,
  ventas_pedidos: FileSpreadsheet,
  ventas_po: Layers,
  alm_materias: Boxes,
  alm_terminado: Package,
  alm_embarques: Truck,
  alm_alertas: AlertTriangle,
  taller_tareas: ClipboardCheck,
  taller_avance: Clock,
  taller_incidencias: AlertTriangle,
};

export const AppShell: React.FC<AppShellProps> = ({
  activeRole,
  activeModule,
  onSelectModule,
  onOpenDataModal,
  onLogout,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const roleDef = ROLE_DEFINITIONS.find((r) => r.id === activeRole)!;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-black flex flex-col">
      {/* Cabecera Institucional Unificada */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 w-full border-b border-black/10 bg-white px-3 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-black hover:bg-neutral-100 shrink-0 cursor-pointer"
            aria-label="Abrir menú de opciones"
          >
            <Menu className="h-5 w-5" />
          </button>

          <BrandLogo className="h-8 sm:h-9 w-auto object-contain shrink-0" alt="Grupo Welvaart" />

          <div className="h-5 w-px bg-black/15 hidden sm:block shrink-0" aria-hidden="true" />

          <span className="text-xs sm:text-sm font-bold text-[#1E2EB9] truncate">
            <span className="sm:hidden">{roleDef.shortLabel}</span>
            <span className="hidden sm:inline">{roleDef.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-neutral-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Cerrar sesión</span>
            <span className="sm:hidden">Salir</span>
          </button>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-[#E9BD02] px-4 py-1.5 text-center text-xs font-bold text-black flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modo sin conexión: trabajando con datos locales sincronizados.</span>
        </div>
      )}

      {/* Cuerpo principal: Menú Lateral Desplegable en Escritorio + Área de Trabajo */}
      <div className="flex flex-1 min-h-0">
        {/* Menú Lateral Desplegable en Escritorio */}
        <aside
          className={`hidden lg:flex flex-col border-r border-black/10 bg-white transition-all duration-150 shrink-0 ${
            sidebarCollapsed ? 'w-20' : 'w-68'
          }`}
          aria-label="Menú lateral de módulos"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            {!sidebarCollapsed && (
              <span className="text-xs font-bold text-neutral-600 truncate">
                Módulos del Rol
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black cursor-pointer"
              aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
              title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {roleDef.modules.map((mod) => {
              const Icon = MODULE_ICONS[mod.id];
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => onSelectModule(mod.id)}
                  title={mod.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2A7CFA] text-white'
                      : 'text-neutral-800 hover:bg-neutral-100 hover:text-black'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="leading-snug">{mod.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-black/10 p-3 space-y-1.5">
            <button
              type="button"
              onClick={onOpenDataModal}
              title="Borrar datos de muestra / Supabase"
              className={`w-full flex items-center gap-3 rounded-lg border border-black/10 bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold text-black hover:border-[#E76108] hover:text-[#E76108] transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Database className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Datos y Supabase</span>}
            </button>

            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        {/* Drawer móvil para opciones de datos / sesión */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <BrandLogo className="h-8 w-auto object-contain" alt="Grupo Welvaart" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-xs font-bold text-[#1E2EB9]">{roleDef.name}</p>
              <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
                {roleDef.modules.map((mod) => {
                  const Icon = MODULE_ICONS[mod.id];
                  const isActive = activeModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        onSelectModule(mod.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-semibold cursor-pointer ${
                        isActive ? 'bg-[#2A7CFA] text-white' : 'text-black hover:bg-neutral-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{mod.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-black/10 pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDataModal();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg border border-black/15 px-3 py-2.5 text-xs font-semibold text-black hover:border-[#E76108] cursor-pointer"
                >
                  <Database className="h-4 w-4 text-[#E76108]" />
                  <span>Borrar muestra / Supabase</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 rounded-lg bg-black px-3 py-2.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Área de Contenido Principal (pb-20 en móvil para librar la Bottom Bar) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 pb-24 lg:pb-8 max-w-[1440px]">
          {children}
        </main>
      </div>

      {/* Navegación Móvil y Tablet (Bottom Bar) */}
      <nav
        aria-label="Navegación rápida de módulos"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-black/10 bg-white px-1 py-1 flex items-center justify-around"
      >
        {roleDef.modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.id];
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                isActive ? 'text-[#2A7CFA]' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[76px] whitespace-nowrap">{mod.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
