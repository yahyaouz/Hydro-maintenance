import * as React from 'react';
import { PenTool, X, Trash2, CheckCircle2 } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSign: (signatureBase64: string, signatoryName: string, signatoryBadge: string) => void;
}

export function DigitalSignatureModal({ isOpen, onClose, title, subtitle = "Approbation réglementaire terrain", onSign }: DigitalSignatureModalProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [signatoryName, setSignatoryName] = React.useState('');
  const [signatoryBadge, setSignatoryBadge] = React.useState('');
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  // Initialize canvas coordinates
  const lastX = React.useRef(0);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#38bdf8'; // Sky blue futuristic stroke
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      // Reset state
      setHasDrawn(false);
      setSignatoryName('');
      setSignatoryBadge('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setHasDrawn(true);

    const pos = getEventCoords(e, canvas);
    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling when signing on touch screens
    if (e.cancelable) {
      e.preventDefault();
    }

    const pos = getEventCoords(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasDrawn) {
      alert('Veuillez apposer votre signature tactile dans la zone prévue à cet effet.');
      return;
    }
    if (!signatoryName.trim()) {
      alert('Nom du valideur requis.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl, signatoryName.trim(), signatoryBadge.trim() || 'TECH-MINE-FIELD');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl animate-scale-in"
        id="signature-control-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-sky-500/10 p-2 text-sky-400">
              <PenTool className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">{title}</h3>
              <p className="text-[11px] font-mono text-slate-400 uppercase">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Identity Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nom du Validateur *
              </label>
              <input
                type="text"
                placeholder="Ex. Yassine Boudaoud"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Badge / Matricule
              </label>
              <input
                type="text"
                placeholder="Ex. 4812-SMI"
                value={signatoryBadge}
                onChange={(e) => setSignatoryBadge(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Signature Canvas Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Zone de Tracé Tactile
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-[10px] font-mono text-rose-400 hover:text-rose-300 uppercase transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Effacer
              </button>
            </div>
            <div className="relative rounded border border-slate-700 bg-slate-950 p-1">
              <canvas
                ref={canvasRef}
                width={464}
                height={160}
                className="block w-full cursor-crosshair rounded bg-slate-950"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#5fc6ff]/30 animate-pulse">Signature tactile requise</span>
                  <span className="text-[9px] font-mono text-slate-500/40 uppercase mt-1">Cliquez et dessinez ou utiliser votre doigt</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-700 bg-slate-950 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 uppercase"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex items-center gap-2 rounded px-5 py-2 text-xs font-bold uppercase text-white shadow transition-all ${
              hasDrawn && signatoryName.trim()
                ? 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Approuver Terrain
          </button>
        </div>
      </div>
    </div>
  );
}
