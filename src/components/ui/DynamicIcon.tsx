import React from 'react';
import {
  LuScissors as Scissors,
  LuZap as Zap,
  LuCrown as Crown,
  LuSparkles as Sparkles,
  LuUser as User,
  LuClock as Clock,
  LuStar as Star,
  LuSmile as Smile,
  LuAnchor as Anchor,
  LuEye as Eye,
  LuBriefcase as Briefcase,
  LuCalendar as Calendar,
  LuCreditCard as CreditCard,
  LuBanknote as Banknote,
  LuMusic as Music,
  LuWifi as Wifi,
  LuTv as Tv,
  LuArmchair as Armchair,
  LuGem as Gem,
  LuRocket as Rocket,
  LuGift as Gift,
  LuCoffee as Coffee,
  LuSprayCan as SprayCan,
  LuDroplets as Droplets,
  LuPaintbrush as Paintbrush,
  LuPalette as Palette,
  LuScroll as Scroll,
  LuFeather as Feather,
  LuCircleCheck as CheckCircle,
  LuUserPlus as UserPlus,
  LuHeart as Heart,
  LuStethoscope as Stethoscope,
  LuWrench as Wrench,
  LuCamera as Camera,
  LuPenTool as PenTool,
  LuPackage as Package,
  LuHouse as Home,
  LuClipboardList as Clipboard,
  LuHand as Hand,
  LuPawPrint as PawPrint,
  LuFlower2 as Flower2,
  LuWaves as Waves,
  LuActivity as Activity,
  LuApple as Apple,
  LuBrain as Brain,
  LuTarget as Target,
  LuLaptop as Laptop,
  LuScale as Scale,
} from 'react-icons/lu';

export const ICON_OPTIONS = [
  'Scissors',
  'Zap',
  'Feather',
  'SprayCan',
  'Droplets',
  'Paintbrush',
  'Scroll',
  'Palette',
  'Crown',
  'Sparkles',
  'Eye',
  'User',
  'Coffee',
  'Star',
  'Anchor',
  'Gem',
  'Clock',
  'Armchair',
  'Gift',
  'Music',
  'Smile',
  'Briefcase',
  'Calendar',
  'CreditCard',
  'Banknote',
  'Wifi',
  'Tv',
  'Rocket',
  'CheckCircle',
  'UserPlus',
  'Heart',
  'Stethoscope',
  'Wrench',
  'Camera',
  'PenTool',
  'Package',
  'Home',
  'Clipboard',
  'Hand',
  'PawPrint',
  'Flower2',
  'Waves',
  'Activity',
  'Apple',
  'Brain',
  'Target',
  'Laptop',
  'Scale',
];

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Aceita os dois formatos que circulam hoje: PascalCase (escolhido na UI) e
 * minúsculas (catálogo semeado pelo backend). Sem isso todo serviço vindo do
 * seed caía no `default` e renderizava a tesoura.
 */
export const normalizeIconName = (name: string): string =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : name;

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size = 24 }) => {
  switch (normalizeIconName(name)) {
    case 'Scissors':
      return <Scissors className={className} size={size} />;
    case 'Zap':
      return <Zap className={className} size={size} />;
    case 'Feather':
      return <Feather className={className} size={size} />;
    case 'SprayCan':
      return <SprayCan className={className} size={size} />;
    case 'Droplets':
      return <Droplets className={className} size={size} />;
    case 'Paintbrush':
      return <Paintbrush className={className} size={size} />;
    case 'Scroll':
      return <Scroll className={className} size={size} />;
    case 'Palette':
      return <Palette className={className} size={size} />;
    case 'Crown':
      return <Crown className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'User':
      return <User className={className} size={size} />;
    case 'Clock':
      return <Clock className={className} size={size} />;
    case 'Star':
      return <Star className={className} size={size} />;
    case 'Smile':
      return <Smile className={className} size={size} />;
    case 'Anchor':
      return <Anchor className={className} size={size} />;
    case 'Eye':
      return <Eye className={className} size={size} />;
    case 'Briefcase':
      return <Briefcase className={className} size={size} />;
    case 'Calendar':
      return <Calendar className={className} size={size} />;
    case 'CreditCard':
      return <CreditCard className={className} size={size} />;
    case 'Banknote':
      return <Banknote className={className} size={size} />;
    case 'Music':
      return <Music className={className} size={size} />;
    case 'Wifi':
      return <Wifi className={className} size={size} />;
    case 'Tv':
      return <Tv className={className} size={size} />;
    case 'Armchair':
      return <Armchair className={className} size={size} />;
    case 'Gem':
      return <Gem className={className} size={size} />;
    case 'Rocket':
      return <Rocket className={className} size={size} />;
    case 'Gift':
      return <Gift className={className} size={size} />;
    case 'Coffee':
      return <Coffee className={className} size={size} />;
    case 'CheckCircle':
      return <CheckCircle className={className} size={size} />;
    case 'UserPlus':
      return <UserPlus className={className} size={size} />;
    case 'Heart':
      return <Heart className={className} size={size} />;
    case 'Stethoscope':
      return <Stethoscope className={className} size={size} />;
    case 'Wrench':
      return <Wrench className={className} size={size} />;
    case 'Camera':
      return <Camera className={className} size={size} />;
    case 'PenTool':
      return <PenTool className={className} size={size} />;
    case 'Package':
      return <Package className={className} size={size} />;
    case 'Home':
      return <Home className={className} size={size} />;
    case 'Clipboard':
      return <Clipboard className={className} size={size} />;
    case 'Hand':
      return <Hand className={className} size={size} />;
    case 'PawPrint':
      return <PawPrint className={className} size={size} />;
    case 'Flower2':
      return <Flower2 className={className} size={size} />;
    case 'Waves':
      return <Waves className={className} size={size} />;
    case 'Activity':
      return <Activity className={className} size={size} />;
    case 'Apple':
      return <Apple className={className} size={size} />;
    case 'Brain':
      return <Brain className={className} size={size} />;
    case 'Target':
      return <Target className={className} size={size} />;
    case 'Laptop':
      return <Laptop className={className} size={size} />;
    case 'Scale':
      return <Scale className={className} size={size} />;
    default:
      return <Scissors className={className} size={size} />;
  }
};
