import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { RoleSelector } from './components/RoleSelector';
import { SplashScreen } from './components/SplashScreen';
import { SystemDataModal } from './components/SystemDataModal';
import { AdminModules } from './components/modules/AdminModules';
import { ProductionModules } from './components/modules/ProductionModules';
import { SalesModules } from './components/modules/SalesModules';
import { WarehouseModules } from './components/modules/WarehouseModules';
import { WorkshopModules } from './components/modules/WorkshopModules';
import { StoreProvider } from './context/StoreContext';
import { ROLE_DEFINITIONS } from './data/initialData';
import { ModuleId, RoleId } from './types/erp';

function WelvaartAppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeRole, setActiveRole] = useState<RoleId | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('admin_dashboard');
  const [dataModalOpen, setDataModalOpen] = useState(false);

  const handleSelectRole = (roleId: RoleId) => {
    const roleDef = ROLE_DEFINITIONS.find((r) => r.id === roleId);
    setActiveRole(roleId);
    if (roleDef && roleDef.modules.length > 0) {
      setActiveModule(roleDef.modules[0].id);
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!activeRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  return (
    <>
      <AppShell
        activeRole={activeRole}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenDataModal={() => setDataModalOpen(true)}
        onLogout={handleLogout}
      >
        {activeRole === 'admin' && (
          <AdminModules
            activeModule={activeModule}
            onOpenDataModal={() => setDataModalOpen(true)}
          />
        )}
        {activeRole === 'produccion' && <ProductionModules activeModule={activeModule} />}
        {activeRole === 'ventas' && <SalesModules activeModule={activeModule} />}
        {activeRole === 'almacen' && <WarehouseModules activeModule={activeModule} />}
        {activeRole === 'taller' && <WorkshopModules activeModule={activeModule} />}
      </AppShell>

      <SystemDataModal open={dataModalOpen} onClose={() => setDataModalOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <WelvaartAppContent />
    </StoreProvider>
  );
}
