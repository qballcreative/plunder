import { motion } from 'framer-motion';
import { Card, CardType } from '@/types/game';
import { cn } from '@/lib/utils';

// Import card images
import cardBack from '@/assets/card-back.png';
import rumCard from '@/assets/cards/rum.png';
import cannonballsCard from '@/assets/cards/cannonballs.png';
import silksCard from '@/assets/cards/silks.png';
import silverCard from '@/assets/cards/silver.png';
import goldCard from '@/assets/cards/gold.png';
import gemstonesCard from '@/assets/cards/gemstones.png';
import shipsCard from '@/assets/cards/ships.png';

interface GameCardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const cardImages: Record<CardType, string> = {
  rum: rumCard,
  cannonballs: cannonballsCard,
  silks: silksCard,
  silver: silverCard,
  gold: goldCard,
  gemstones: gemstonesCard,
  ships: shipsCard,
};

const cardLabels: Record<CardType, string> = {
  rum: 'Rum',
  cannonballs: 'Cannonballs',
  silks: 'Silks',
  silver: 'Silver',
  gold: 'Gold',
  gemstones: 'Gemstones',
  ships: 'Ship',
};

const sizeClasses = {
  sm: 'w-14 h-20 text-[10px]',
  md: 'w-20 h-28 text-xs',
  lg: 'w-24 h-32 text-sm',
};

export const GameCard = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  size = 'md',
  className,
}: GameCardProps) => {
  const cardImage = cardImages[card.type];
  const label = cardLabels[card.type];

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        'relative cursor-pointer select-none perspective-1000',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{ 
        y: selected ? -10 : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg border-2 overflow-hidden',
            'shadow-lg bg-card',
            selected ? 'border-primary ring-2 ring-primary/50 shadow-[0_0_15px_hsl(var(--gold)/0.5)]' : 'border-primary/40',
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${cardImage})` }}
          />
          
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          
          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 text-center">
            <span className="font-bold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {label}
            </span>
          </div>
          
          {/* Selected indicator */}
          {selected && (
            <motion.div
              className="absolute inset-0 border-2 border-primary rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              layoutId="selection"
            />
          )}
          
          {/* Decorative corners */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-primary/60" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-primary/60" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-primary/60" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-primary/60" />
        </div>

        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-primary/40 overflow-hidden shadow-lg"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${cardBack})` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
