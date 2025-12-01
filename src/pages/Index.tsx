import { useGameStore } from '@/store/gameStore';
import { LandingPage } from '@/components/game/LandingPage';
import { GameBoard } from '@/components/game/GameBoard';

const Index = () => {
  const { phase } = useGameStore();

  if (phase === 'lobby') {
    return <LandingPage />;
  }

  return <GameBoard />;
};

export default Index;
