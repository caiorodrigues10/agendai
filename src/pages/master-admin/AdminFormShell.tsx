import React from 'react';
import { ModalShell, type ModalShellProps } from '../../components/patterns/ModalShell';

export const ADMIN_FORM_FOOTER =
  'flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end [&>button]:sm:flex-none [&>button]:sm:min-w-28';

/** Admin-only layout: scrollable content, persistent actions and wider desktop forms. */
export function AdminFormShell({
  description,
  title,
  children,
  body,
  ...props
}: ModalShellProps & { description?: string }) {
  return (
    <ModalShell
      {...props}
      className={`${props.className ?? ''} [&>header]:py-3 [&>header>div]:items-center [&>header>div>div>div]:items-center [&>header_button]:flex [&>header_button]:min-h-11 [&>header_button]:min-w-11 [&>header_button]:items-center [&>header_button]:justify-center [&>header_button]:outline-none [&>header_button]:focus-visible:ring-2 [&>header_button]:focus-visible:ring-focus`}
      title={
        <>
          <h2 className="text-base font-semibold leading-6 text-text-primary">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm leading-5 text-text-secondary">{description}</p>
          )}
        </>
      }
      variant="sheet"
      body={body ?? children}
      footer={props.footer ? <div className={ADMIN_FORM_FOOTER}>{props.footer}</div> : undefined}
    />
  );
}
