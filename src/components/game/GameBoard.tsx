import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, calculateScore } from '@/store/gameStore';
import { Market } from './Market';
import { PlayerHand } from './PlayerHand';
import { TokenStack } from './TokenStack';
import { BonusTokens } from './BonusTokens';
import { ScoreBoard } from './ScoreBoard';
import { Button } from '@/components/ui/button';
import { GoodsType, Card } from '@/types/game';
import { Trophy, RotateCcw, Home, Swords, CloudLightning, Crosshair, Gift, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOODS_ORDER: GoodsType[] = ['gemstones', 'gold', 'silver', 'silks', 'cannonballs', 'rum'];

export const GameBoard = () => {
  const { 
    players, 
    currentPlayerIndex, 
    tokenStacks, 
    bonusTokens,
    phase,
    lastAction,
    nextRound,
    resetGame,
    getRoundWinner,
    getWinner,
    round,
    optionalRules,
    turnCount,
    canUsePirateRaid,
    pirateRaid,
    hiddenTreasures,
  } = useGameStore();

  const [isRaidMode, setIsRaidMode] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const humanPlayer = players.find((p) => !p.isAI)!;
  const aiPlayer = players.find((p) => p.isAI)!;

  const handlePirateRaid = (card: Card) => {
    pirateRaid(card.id);
    setIsRaidMode(false);
  };

  const activeRulesCount = Object.values(optionalRules).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="font-pirate text-3xl lg:text-4xl text-primary">Plunder</h1>
            
            {/* Active Rules Indicators */}
            {activeRulesCount > 0 && (
              <div className="flex items-center gap-1">
                {optionalRules.stormRule && (
                  <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30" title="Storm Rule Active">
                    <CloudLightning className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                {optionalRules.pirateRaid && (
                  <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30" title="Pirate Raid Active">
                    <Crosshair className="w-4 h-4 text-red-400" />
                  </div>
                )}
                {optionalRules.treasureChest && (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30" title="Treasure Chest Active">
                    <Gift className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Storm Rule Turn Counter */}
            {optionalRules.stormRule && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <CloudLightning className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400">
                  {3 - (turnCount % 3)} turn{3 - (turnCount % 3) !== 1 ? 's' : ''} to storm
                </span>
              </div>
            )}

            {lastAction && (
              <motion.span
                key={lastAction}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-muted-foreground px-3 py-1 bg-card rounded-full border border-border"
              >
                {lastAction}
              </motion.span>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={resetGame}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Token stacks */}
          <motion.aside
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-4 rounded-xl bg-card border border-primary/20">
              <h3 className="font-pirate text-lg text-primary mb-4 text-center">Treasure</h3>
              <div className="grid grid-cols-2 gap-4">
                {GOODS_ORDER.map((type) => (
                  <TokenStack key={type} type={type} tokens={tokenStacks[type]} />
                ))}
              </div>
            </div>

            <BonusTokens
              threeCards={bonusTokens.three}
              fourCards={bonusTokens.four}
              fiveCards={bonusTokens.five}
            />

            {/* Pirate Raid Button */}
            {optionalRules.pirateRaid && currentPlayerIndex === 0 && phase === 'playing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-card border border-red-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crosshair className="w-5 h-5 text-red-400" />
                  <h3 className="font-pirate text-lg text-red-400">Pirate Raid</h3>
                </div>
                
                {humanPlayer.hasUsedPirateRaid ? (
                  <p className="text-xs text-muted-foreground">Already used this game</p>
                ) : canUsePirateRaid() && !currentPlayer.isAI ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">
                      Steal one card from your opponent!
                    </p>
                    <Button
                      size="sm"
                      variant={isRaidMode ? 'destructive' : 'outline'}
                      className={cn(
                        'w-full',
                        !isRaidMode && 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      )}
                      onClick={() => setIsRaidMode(!isRaidMode)}
                    >
                      {isRaidMode ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel Raid
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-4 h-4 mr-1" />
                          Activate Raid
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {currentPlayer.isAI ? 'Wait for your turn' : 'Cannot raid (hand full or no targets)'}
                  </p>
                )}
              </motion.div>
            )}
          </motion.aside>

          {/* Main game area */}
          <motion.main
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Opponent's hand */}
            <PlayerHand
              player={aiPlayer}
              isCurrentPlayer={currentPlayerIndex === 1}
              isOpponent
              isRaidMode={isRaidMode && currentPlayerIndex === 0}
              onRaidCard={handlePirateRaid}
            />

            {/* Market */}
            <Market />

            {/* Player's hand */}
            <PlayerHand
              player={humanPlayer}
              isCurrentPlayer={currentPlayerIndex === 0}
            />

            {/* Turn indicator */}
            <AnimatePresence>
              {currentPlayer.isAI && phase === 'playing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <div className="px-6 py-3 rounded-xl bg-card/95 border border-primary/30 shadow-xl">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      >
                        <Swords className="w-6 h-6 text-primary" />
                      </motion.div>
                      <span className="font-pirate text-xl text-primary">
                        Pirate AI is thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>

          {/* Right sidebar - Scoreboard */}
          <motion.aside
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ScoreBoard />
          </motion.aside>
        </div>

        {/* Round End Modal */}
        <AnimatePresence>
          {phase === 'roundEnd' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card p-8 rounded-2xl border border-primary/30 shadow-2xl max-w-md w-full"
              >
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="font-pirate text-3xl text-primary mb-2">
                    Round {round} Complete!
                  </h2>
                  
                  {getRoundWinner() && (
                    <p className="text-xl mb-4">
                      <span className="text-primary font-bold">
                        {getRoundWinner()?.name}
                      </span>{' '}
                      wins this round!
                    </p>
                  )}

                  {/* Hidden Treasures Reveal */}
                  {optionalRules.treasureChest && hiddenTreasures.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-amber-400" />
                        <span className="font-pirate text-amber-400">Treasure Chest Revealed!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {hiddenTreasures.map((treasure) => {
                          const player = players.find(p => p.id === treasure.playerId);
                          return (
                            <div key={treasure.playerId} className="text-muted-foreground">
                              {player?.name}: +{treasure.tokens.reduce((sum, t) => sum + t.value, 0)} pts
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <p className="font-bold text-foreground">{player.name}</p>
                        <p className="text-3xl font-pirate text-primary">
                          {calculateScore(player)}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    ))}
                  </div>

                  <Button onClick={nextRound} className="game-button w-full">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    {round >= 3 ? 'See Final Results' : `Start Round ${round + 1}`}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game End Modal */}
        <AnimatePresence>
          {phase === 'gameEnd' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card p-8 rounded-2xl border border-primary/30 shadow-2xl max-w-md w-full text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Trophy className="w-24 h-24 text-primary mx-auto mb-4" />
                </motion.div>
                
                <h2 className="font-pirate text-4xl text-primary mb-2">
                  {getWinner()?.isAI ? 'Defeated!' : 'Victory!'}
                </h2>
                
                <p className="text-xl mb-6">
                  <span className="text-primary font-bold">
                    {getWinner()?.name}
                  </span>{' '}
                  wins the game!
                </p>

                <Button onClick={resetGame} className="game-button w-full">
                  <Home className="w-5 h-5 mr-2" />
                  Return to Port
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
