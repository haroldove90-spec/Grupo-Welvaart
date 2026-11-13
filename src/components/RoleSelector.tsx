import React from 'react';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { RoleId } from '../types/erp';
import { BrandLogo } from './BrandLogo';

interface RoleSelectorProps {
  onSelectRole: (roleId: RoleId) => void;
}

const ROLE_ACCENTS: Record<RoleId, string> = {
  admin: '#1E2EB9',
  produccion: '#2A7CFA',
  ventas: '#E9BD02',
  almacen: '#E76108',
  taller: '#000000',
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="mb-10 sm:mb-12 flex justify-center">
          <BrandLogo
            className="h-20 sm:h-24 w-auto object-contain"
            alt="Grupo Welvaart"
          />
        </div>

        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ROLE_DEFINITIONS.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className="group relative flex min-h-[128px] sm:min-h-[148px] flex-col items-center justify-center rounded-xl border border-black/10 bg-white p-5 sm:p-6 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-[#2A7CFA] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A7CFA] cursor-pointer"
            >
              <span
                className="mb-4 h-1 w-10 rounded-full transition-all duration-150 group-hover:w-14"
                style={{ backgroundColor: ROLE_ACCENTS[role.id] }}
                aria-hidden="true"
              />
              <span className="text-sm sm:text-base font-bold leading-snug text-black text-balance">
                {role.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};
