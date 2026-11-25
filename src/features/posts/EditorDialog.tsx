import React from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';

/** Diálogo modal do editor (portal no `body` + trava de foco). */
export function EditorDialog({ children }: { children: React.ReactNode }) {
  return createPortal(
    <FocusLock returnFocus>
      <div role="dialog" aria-modal="true" aria-label="Editor de publicação" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center p-0 sm:p-4">
        {children}
      </div>
    </FocusLock>,
    document.body
  );
}
