import React, { useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { hasNativePrompt, isInstalled, isIOS, isAndroid, promptNativeInstall } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const accepted = await promptNativeInstall();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 rounded-lg bg-[#2A7CFA] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E2EB9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A7CFA] whitespace-nowrap shrink-0 cursor-pointer"
        aria-label="Instalar aplicación Grupo Welvaart"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Instalar</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 text-black shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Grupo Welvaart"
                  className="h-11 w-11 rounded-lg object-contain"
                />
                <div>
                  <h3 id="pwa-install-title" className="text-base font-bold text-black">
                    Instalar Grupo Welvaart
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Acceso directo en Android, iOS y computadora
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-neutral-800">
              {isIOS ? (
                <div className="space-y-2.5 rounded-lg border border-black/10 bg-neutral-50 p-4">
                  <p className="font-semibold text-black flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-[#2A7CFA]" />
                    Pasos para iPhone / iPad (Safari):
                  </p>
                  <p className="flex items-center gap-2 text-xs leading-relaxed">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">1.</span>
                    Toca el ícono <Share className="inline h-4 w-4 text-[#2A7CFA]" />{' '}
                    <strong>Compartir</strong> en la barra inferior de Safari.
                  </p>
                  <p className="flex items-center gap-2 text-xs leading-relaxed">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">2.</span>
                    Desliza hacia abajo y elige <PlusSquare className="inline h-4 w-4 text-[#2A7CFA]" />{' '}
                    <strong>Agregar a inicio</strong>.
                  </p>
                  <p className="flex items-center gap-2 text-xs leading-relaxed">
                    <span className="font-mono-tabular font-bold text-[#1E2EB9]">3.</span>
                    Confirma tocando <strong>Agregar</strong> en la esquina superior derecha.
                  </p>
                </div>
              ) : isAndroid ? (
                <div className="space-y-2 rounded-lg border border-black/10 bg-neutral-50 p-4 text-xs leading-relaxed">
                  <p className="font-semibold text-black">Pasos para Android (Chrome / Edge):</p>
                  <p>1. Abre el menú de opciones del navegador (tres puntos arriba a la derecha).</p>
                  <p>2. Selecciona <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.</p>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-black/10 bg-neutral-50 p-4 text-xs leading-relaxed">
                  <p className="font-semibold text-black">Pasos para Computadora (Chrome / Edge):</p>
                  <p>1. Haz clic en el ícono de instalación en el extremo derecho de la barra de direcciones.</p>
                  <p>2. O abre el menú del navegador → <strong>Guardar y compartir</strong> → <strong>Instalar Grupo Welvaart</strong>.</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
