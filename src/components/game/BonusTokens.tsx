import { motion } from 'framer-motion';
import { BonusToken } from '@/types/game';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface BonusTokensProps {
  threeCards: BonusToken[];
  fourCards: BonusToken[];
  fiveCards: BonusToken[];
}

const BonusStack = ({ count, tokens }: { count: number; tokens: BonusToken[] }) => {
  const isEmpty = tokens.length === 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{count}+ cards</span>
      
      <div className="relative w-10 h-10">
        {tokens.slice(0, 3).reverse().map((token, index) => (
          <motion.div
            key={token.id}
            className={cn(
              'absolute w-8 h-8 rounded border border-primary/40',
              'bg-gradient-to-br from-primary to-primary/70',
              'flex items-center justify-center shadow-md'
            )}
            style={{
              bottom: index * 2,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: index,
            }}
          >
            {index === tokens.slice(0, 3).length - 1 && (
              <Star className="w-4 h-4 text-primary-foreground" />
            )}
          </motion.div>
        ))}

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded border border-dashed border-muted-foreground/30" />
          </div>
        )}
      </div>

      <span className="text-xs text-primary font-bold">{tokens.length}</span>
    </div>
  );
};

export const BonusTokens = ({ threeCards, fourCards, fiveCards }: BonusTokensProps) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border">
      <span className="text-sm font-pirate text-primary">Bonus</span>
      <BonusStack count={3} tokens={threeCards} />
      <BonusStack count={4} tokens={fourCards} />
      <BonusStack count={5} tokens={fiveCards} />
    </div>
  );
};
