import type { ReactNode, KeyboardEvent } from 'react';
interface Props { title: string; busy: boolean; onClose: () => void; children: ReactNode }
export const Modal = ({ title, busy, onClose, children }: Props) => {
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key !== 'Tab') return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled)'));
    const first = elements[0]; const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={keyboard} className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"><div className="mb-6 flex items-center justify-between gap-4"><h2 id="dialog-title" className="font-display text-3xl font-bold">{title}</h2><button type="button" aria-label="Cerrar modal" disabled={busy} onClick={onClose} className="button-secondary">×</button></div>{children}</section></div>;
};
