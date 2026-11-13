import React from 'react';
import { WORKFLOW_PHASES } from '../data/initialData';
import { useStore } from '../context/StoreContext';
import { WorkflowPhase } from '../types/erp';

interface WorkflowPipelineStripProps {
  activePhase?: WorkflowPhase;
  onSelectPhase?: (phase: WorkflowPhase) => void;
}

export const WorkflowPipelineStrip: React.FC<WorkflowPipelineStripProps> = ({
  activePhase,
  onSelectPhase,
}) => {
  const { state } = useStore();

  const phaseCounts = WORKFLOW_PHASES.map((p) => ({
    ...p,
    count: state.orders.filter((o) => o.faseActual === p.phase).length,
  }));

  return (
    <section
      aria-label="Flujo de Trabajo Operativo de 7 Fases"
      className="rounded-xl border border-black/10 bg-white p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-xs font-bold text-black">
          Flujo Operativo y de Producción (7 Fases)
        </h2>
        <span className="text-xs text-neutral-600 font-mono-tabular">
          {state.orders.length} pedidos en ciclo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
        {phaseCounts.map((item) => {
          const isActive = activePhase === item.phase;
          return (
            <button
              key={item.phase}
              type="button"
              onClick={() => onSelectPhase?.(item.phase)}
              className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#2A7CFA] bg-[#2A7CFA]/8'
                  : 'border-black/10 bg-[#F8FAFC] hover:border-[#2A7CFA]/50'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="font-mono-tabular text-[11px] font-bold text-[#1E2EB9]">
                  F{item.phase}
                </span>
                <span className="font-mono-tabular text-sm font-bold text-black">
                  {item.count}
                </span>
              </div>
              <span className="mt-1 text-xs font-semibold text-black truncate w-full">
                {item.shortTitle}
              </span>
              <span className="text-[11px] text-neutral-600 truncate w-full">
                {item.ownerRole}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
