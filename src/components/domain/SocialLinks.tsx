import React from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import type { SocialNetwork } from '../../utils/socialLinks';

/** Ícone de marca (fa6) por rede social — perfil público e Configurações. */
export const SOCIAL_NETWORK_ICONS: Record<
  SocialNetwork,
  React.ComponentType<{ size?: number | string; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  x: FaXTwitter,
  youtube: FaYoutube,
  facebook: FaFacebookF,
};

export function SocialNetworkIcon({
  network,
  size = 16,
  className,
}: {
  network: SocialNetwork;
  size?: number;
  className?: string;
}) {
  const Icon = SOCIAL_NETWORK_ICONS[network];
  return <Icon size={size} className={className} aria-hidden />;
}
