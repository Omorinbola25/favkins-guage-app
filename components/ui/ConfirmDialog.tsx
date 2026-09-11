'use client';

import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

type ConfirmTone = 'danger' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  pending?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_BUTTON_STYLES: Record<ConfirmTone, string> = {
  danger: 'bg-danger hover:bg-danger/90 focus-visible:ring-danger/50 text-white',
  default: 'bg-primary hover:bg-primary/90 focus-visible:ring-primary/50 text-white',
};

const ICON_STYLES: Record<ConfirmTone, string> = {
  danger: 'bg-danger/10 text-danger',
  default: 'bg-primary/10 text-primary',
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  pending = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestCancel = () => {
    if (!pending) onCancel();
  };

  const handleNativeCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    requestCancel();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) requestCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={pending}
      onCancel={handleNativeCancel}
      onClick={handleBackdropClick}
      className="text-foreground m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="bg-card border-border rounded-2xl border p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[tone]}`}
          >
            <AlertTriangle size={20} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-foreground text-base font-semibold">
              {title}
            </h2>
            <div
              id={descriptionId}
              className="text-muted-foreground mt-1.5 text-sm leading-relaxed"
            >
              {description}
            </div>
          </div>
        </div>

        {children && <div className="mt-5">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={requestCancel}
            disabled={pending}
            className="border-border text-secondary-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary/50 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${CONFIRM_BUTTON_STYLES[tone]}`}
          >
            {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
