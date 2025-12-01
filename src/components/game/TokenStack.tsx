import { motion, AnimatePresence } from 'framer-motion';
import { Token, GoodsType } from '@/types/game';
import { cn } from '@/lib/utils';
import { Wine, CircleDot, Shirt, Coins, Gem } from 'lucide-react';

interface TokenStackProps {
  type: GoodsType;
  tokens: Token[];
}

const tokenConfig: Record<GoodsType, { icon: React.ReactNode; bgClass: string; label: string }> = {
  rum: {
    icon: <Wine className="w-4 h-4" />,
    bgClass: 'from-amber-700 to-amber-900',
    label: 'Rum',
  },
  cannonballs: {
    icon: <CircleDot className="w-4 h-4" />,
    bgClass: 'from-slate-500 to-slate-700',
    label: 'Cannonballs',
  },
  silks: {
    icon: <Shirt className="w-4 h-4" />,
    bgClass: 'from-purple-600 to-purple-800',
    label: 'Silks',
  },
  silver: {
    icon: <Coins className="w-4 h-4" />,
    bgClass: 'from-gray-300 to-gray-500',
    label: 'Silver',
  },
  gold: {
    icon: <Coins className="w-4 h-4" />,
    bgClass: 'from-yellow-400 to-yellow-600',
    label: 'Gold',
  },
  gemstones: {
    icon: <Gem className="w-4 h-4" />,
    bgClass: 'from-emerald-400 to-emerald-600',
    label: 'Gemstones',
  },
};

export const TokenStack = ({ type, tokens }: TokenStackProps) => {
  const config = tokenConfig[type];
  const topToken = tokens[0];
  const isEmpty = tokens.length === 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-medium">{config.label}</span>
      
      <div className="relative w-14 h-14">
        {/* Stack effect */}
        {tokens.slice(0, 3).reverse().map((token, index) => (
          <motion.div
            key={token.id}
            className={cn(
              'absolute w-12 h-12 rounded-full border-2 border-primary/40',
              'bg-gradient-to-br flex items-center justify-center',
              config.bgClass,
              'shadow-md'
            )}
            style={{
              bottom: index * 3,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: index,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index === tokens.slice(0, 3).length - 1 && topToken && (
              <>
                <span className="text-foreground font-bold text-sm drop-shadow-md">
                  {topToken.value}
                </span>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card flex items-center justify-center">
                  {config.icon}
                </div>
              </>
            )}
          </motion.div>
        ))}

        {/* Empty state */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-muted-foreground text-xs">Empty</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="text-xs text-primary font-bold">{tokens.length} left</span>
    </div>
  );
};
