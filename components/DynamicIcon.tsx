import React from 'react';
import { 
  Scissors, 
  Zap, 
  Crown, 
  Sparkles, 
  User, 
  Clock, 
  Star, 
  Smile, 
  Anchor,
  Eye,
  Briefcase,
  Calendar,
  CreditCard,
  Banknote,
  Music,
  Wifi,
  Tv,
  Armchair,
  Gem,
  Rocket,
  Gift,
  Coffee,
  SprayCan,   // Gel/Spray
  Droplets,   // Shampoo/Hidratação
  Paintbrush, // Tinta/Pintura
  Palette,    // Cores
  Scroll,     // Toalha (formato enrolado)
  Feather     // Navalha/Suavidade
} from 'lucide-react';

// Lista reorganizada para priorizar itens de barbearia
export const ICON_OPTIONS = [
  'Scissors',   // Corte
  'Zap',        // Maquininha
  'Feather',    // Navalha/Barba feita
  'SprayCan',   // Gel/Spray
  'Droplets',   // Shampoo/Hidratação
  'Paintbrush', // Tinta/Pigmentação
  'Scroll',     // Toalha Quente
  'Palette',    // Tinta
  'Crown',      // Premium
  'Sparkles',   // Limpeza/Acabamento
  'Eye',        // Sobrancelha
  'User',       // Cliente
  'Coffee',     // Bar/Café
  'Star',       // Destaque
  'Anchor',     // Old School
  'Gem',        // Luxo
  'Clock',      // Tempo
  'Armchair',   // Cadeira
  'Gift',       // Promoção
  'Music'       // Ambiente
];

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size = 24 }) => {
  switch (name) {
    case 'Scissors': return <Scissors className={className} size={size} />;
    case 'Zap': return <Zap className={className} size={size} />;
    case 'Feather': return <Feather className={className} size={size} />;
    case 'SprayCan': return <SprayCan className={className} size={size} />;
    case 'Droplets': return <Droplets className={className} size={size} />;
    case 'Paintbrush': return <Paintbrush className={className} size={size} />;
    case 'Scroll': return <Scroll className={className} size={size} />;
    case 'Palette': return <Palette className={className} size={size} />;
    case 'Crown': return <Crown className={className} size={size} />;
    case 'Sparkles': return <Sparkles className={className} size={size} />;
    case 'User': return <User className={className} size={size} />;
    case 'Clock': return <Clock className={className} size={size} />;
    case 'Star': return <Star className={className} size={size} />;
    case 'Smile': return <Smile className={className} size={size} />;
    case 'Anchor': return <Anchor className={className} size={size} />;
    case 'Eye': return <Eye className={className} size={size} />;
    case 'Briefcase': return <Briefcase className={className} size={size} />;
    case 'Calendar': return <Calendar className={className} size={size} />;
    case 'CreditCard': return <CreditCard className={className} size={size} />;
    case 'Banknote': return <Banknote className={className} size={size} />;
    case 'Music': return <Music className={className} size={size} />;
    case 'Wifi': return <Wifi className={className} size={size} />;
    case 'Tv': return <Tv className={className} size={size} />;
    case 'Armchair': return <Armchair className={className} size={size} />;
    case 'Gem': return <Gem className={className} size={size} />;
    case 'Rocket': return <Rocket className={className} size={size} />;
    case 'Gift': return <Gift className={className} size={size} />;
    case 'Coffee': return <Coffee className={className} size={size} />;
    default: return <Scissors className={className} size={size} />;
  }
};