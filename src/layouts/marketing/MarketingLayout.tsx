import React from 'react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SeoHead } from '../../components/marketing/SeoHead';

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export const MARKETING_WRAPPER =
  'min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-accent/30';

export interface MarketingLayoutProps {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  image?: string;
  jsonLd?: JsonLd;
  wrapperClassName?: string;
  background?: React.ReactNode;
  afterFooter?: React.ReactNode;
  children?: React.ReactNode;
}

export const MarketingLayout = React.forwardRef<HTMLDivElement, MarketingLayoutProps>(
  (
    {
      title,
      description,
      path,
      noindex,
      image,
      jsonLd,
      wrapperClassName = MARKETING_WRAPPER,
      background,
      afterFooter,
      children,
    },
    ref
  ) => (
    <div ref={ref} className={wrapperClassName}>
      {title && description && path && (
        <SeoHead
          title={title}
          description={description}
          path={path}
          noindex={noindex}
          image={image}
          jsonLd={jsonLd}
        />
      )}
      {background}
      <MarketingNav />
      {children}
      <MarketingFooter />
      {afterFooter}
    </div>
  )
);
MarketingLayout.displayName = 'MarketingLayout';
