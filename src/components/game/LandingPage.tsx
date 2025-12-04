import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Difficulty, OptionalRules } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.jpg';
import logoImage from '@/assets/Logo.png';
import { Anchor, Swords, Users, Ship, Gem, Coins, Wine, CircleDot, Shirt, CloudLightning, Crosshair, Gift } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { MultiplayerLobby } from './MultiplayerLobby';
const difficultyConfig: Record<Difficulty, {
  label: string;
  description: string;
  color: string;
}> = {
  easy: {
    label: 'Cabin Boy',
    description: 'Perfect for landlubbers',
    color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
  },
  medium: {
    label: 'First Mate',
    description: 'A worthy challenge',
    color: 'text-primary border-primary/30 bg-primary/10'
  },
  hard: {
    label: 'Dread Pirate',
    description: 'Only for sea dogs',
    color: 'text-destructive border-destructive/30 bg-destructive/10'
  }
};
const optionalRulesConfig = [{
  key: 'stormRule' as keyof OptionalRules,
  icon: CloudLightning,
  label: 'Storm Rule',
  description: 'Every 3rd turn, discard 2 random market cards',
  color: 'text-blue-400 border-blue-400/30 bg-blue-400/10'
}, {
  key: 'pirateRaid' as keyof OptionalRules,
  icon: Crosshair,
  label: 'Pirate Raid',
  description: 'Steal one card from opponent once per game',
  color: 'text-red-400 border-red-400/30 bg-red-400/10'
}, {
  key: 'treasureChest' as keyof OptionalRules,
  icon: Gift,
  label: 'Treasure Chest',
  description: 'Hidden bonus tokens revealed at round end',
  color: 'text-amber-400 border-amber-400/30 bg-amber-400/10'
}];
const goods = [{
  icon: Wine,
  label: 'Rum',
  color: 'text-amber-500'
}, {
  icon: CircleDot,
  label: 'Cannonballs',
  color: 'text-slate-400'
}, {
  icon: Shirt,
  label: 'Silks',
  color: 'text-purple-400'
}, {
  icon: Coins,
  label: 'Silver',
  color: 'text-gray-300'
}, {
  icon: Coins,
  label: 'Gold',
  color: 'text-yellow-400'
}, {
  icon: Gem,
  label: 'Gemstones',
  color: 'text-emerald-400'
}];
export const LandingPage = () => {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [optionalRules, setOptionalRules] = useState<OptionalRules>({
    stormRule: false,
    pirateRaid: false,
    treasureChest: false
  });
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const {
    startGame
  } = useGameStore();
  const toggleRule = (key: keyof OptionalRules) => {
    setOptionalRules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleStart = () => {
    const name = playerName.trim() || 'Captain';
    startGame(name, difficulty, optionalRules);
  };
  return <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroBg})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      {/* Settings Button - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <SettingsPanel />
      </div>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => <motion.div key={i} className="absolute text-primary/10" initial={{
          x: `${20 + i * 30}%`,
          y: `${10 + i * 25}%`,
          rotate: Math.random() * 30
        }} animate={{
          y: [null, `${5 + i * 20}%`],
          rotate: [null, Math.random() * 30 - 15]
        }} transition={{
          duration: 15 + Math.random() * 10,
          repeat: Infinity,
          repeatType: 'reverse'
        }}>
              {i % 2 === 0 ? <Anchor className="w-24 h-24 lg:w-32 lg:h-32" /> : <Ship className="w-28 h-28 lg:w-40 lg:h-40" />}
            </motion.div>)}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div initial={{
          opacity: 0,
          y: -30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div animate={{
              rotate: [0, -10, 10, 0]
            }} transition={{
              duration: 4,
              repeat: Infinity
            }}>
                <img src={logoImage} alt="Plunder Logo" className="w-16 h-16 lg:w-24 lg:h-24 drop-shadow-lg object-contain" />
              </motion.div>
            </div>
            
            <h1 className="font-pirate text-6xl lg:text-8xl text-primary mb-2 drop-shadow-[0_0_30px_hsl(var(--gold)/0.5)]">
              Plunder
            </h1>
            <p className="text-xl lg:text-2xl text-foreground/80 font-serif">
              A Pirate Trading Card Game
            </p>
          </motion.div>

          {/* Goods showcase */}
          <motion.div className="flex items-center justify-center gap-4 lg:gap-6 my-8 flex-wrap" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3
        }}>
            {goods.map((good, i) => <motion.div key={good.label} initial={{
            opacity: 0,
            scale: 0
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.4 + i * 0.1
          }} className="flex flex-col items-center p-2 rounded-lg bg-card/30 backdrop-blur-sm">
                <good.icon className={cn('w-8 h-8 lg:w-10 lg:h-10', good.color)} />
                <span className="text-xs text-foreground/70 mt-1">{good.label}</span>
              </motion.div>)}
          </motion.div>

          {/* Game setup or Multiplayer Lobby */}
          <AnimatePresence mode="wait">
            {showMultiplayer ? <MultiplayerLobby key="multiplayer" playerName={playerName || 'Captain'} optionalRules={optionalRules} onBack={() => setShowMultiplayer(false)} /> : <motion.div key="setup" className="bg-card/90 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-primary/30 shadow-2xl max-w-md mx-auto" initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -30
          }} transition={{
            delay: 0.5
          }}>
                <h2 className="font-pirate text-2xl lg:text-3xl text-primary mb-6">Set Sail</h2>

                {/* Name input */}
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-2 text-left">Your Pirate Name</label>
                  <Input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Captain..." className="bg-muted/50 border-primary/30 focus:border-primary text-center text-lg" onKeyDown={e => e.key === 'Enter' && handleStart()} />
                </div>

                {/* Difficulty selection */}
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-3 text-left">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(difficultyConfig) as Difficulty[]).map(level => {
                  const config = difficultyConfig[level];
                  return <button key={level} onClick={() => setDifficulty(level)} className={cn('p-3 rounded-lg border-2 transition-all duration-200', difficulty === level ? config.color : 'border-border hover:border-primary/30 bg-muted/30')}>
                          <p className="font-bold text-sm">{config.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 hidden lg:block">{config.description}</p>
                        </button>;
                })}
                  </div>
                </div>

                {/* Optional Rules */}
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-3 text-left">Optional Rules</label>
                  <div className="space-y-2">
                    {optionalRulesConfig.map(rule => <button key={rule.key} onClick={() => toggleRule(rule.key)} className={cn('w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3', optionalRules[rule.key] ? rule.color : 'border-border hover:border-primary/30 bg-muted/30')}>
                        <rule.icon className={cn('w-5 h-5 flex-shrink-0', optionalRules[rule.key] ? '' : 'text-muted-foreground')} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{rule.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{rule.description}</p>
                        </div>
                        <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors', optionalRules[rule.key] ? 'bg-current border-current' : 'border-muted-foreground')}>
                          {optionalRules[rule.key] && <motion.div initial={{
                      scale: 0
                    }} animate={{
                      scale: 1
                    }} className="w-2 h-2 rounded-full bg-background" />}
                        </div>
                      </button>)}
                  </div>
                </div>

                {/* Start buttons */}
                <div className="space-y-3">
                  <Button onClick={handleStart} variant="gold" size="xl" className="w-full font-pirate">
                    <Swords className="w-6 h-6 mr-2" />
                    Battle the AI
                  </Button>
                  
                  <Button variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10" onClick={() => setShowMultiplayer(true)}>
                    <Users className="w-5 h-5 mr-2" />
                    Multiplayer (Under Construction)  
                  </Button>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Rules preview */}
          {!showMultiplayer && <motion.div className="mt-8 text-sm text-foreground/60" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.8
        }}>
              <p className="mb-2 text-lg">Sail the Seas</p>
              <p>Trade goods • Collect ships • Plunder treasure • Become the richest pirate!</p>
            </motion.div>}
        </div>
      </section>

      {/* How to play section */}
      {!showMultiplayer && <section className="relative py-12 px-4 bg-card/80 backdrop-blur-sm border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-pirate text-3xl text-primary text-center mb-8">How to Plunder</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{
            icon: <Ship className="w-10 h-10" />,
            title: 'Take',
            description: 'Take a card from the market or take all ships at once to grow your fleet.'
          }, {
            icon: <Swords className="w-10 h-10" />,
            title: 'Exchange',
            description: 'Swap 2+ cards between your hand and the market. Use ships as wildcards!'
          }, {
            icon: <Coins className="w-10 h-10" />,
            title: 'Sell',
            description: 'Sell matching cards for treasure tokens. More cards means bigger bonus rewards!'
          }].map((item, i) => <motion.div key={item.title} className="p-6 rounded-xl bg-muted/50 border border-border text-center hover:border-primary/30 transition-colors" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.9 + i * 0.1
          }} whileHover={{
            scale: 1.02
          }}>
                  <div className="text-primary mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="font-pirate text-xl text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>)}
            </div>

            {/* Win condition */}
            <motion.div className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20 text-center" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1.2
        }}>
              <h3 className="font-pirate text-xl text-primary mb-2">Victory Condition</h3>
              <p className="text-foreground/80">
                Win 2 out of 3 rounds. Each round ends when the deck empties or 3 goods token stacks are depleted.
                <br />
                The pirate with the most treasure points wins the round!
              </p>
            </motion.div>
          </div>
        </section>}

      {/* Footer */}
      <footer className="relative py-6 px-4 text-center text-sm text-muted-foreground border-t border-border bg-card/50">
        <p>Plunder © 2025 • QBall Creative</p>
      </footer>
    </div>;
};