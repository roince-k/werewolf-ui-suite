import { useState } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import WerewolfGame from '@/components/games/WerewolfGame';
import UndercoverGame from '@/components/games/UndercoverGame';

const GameHub = () => {
  const [activeGame, setActiveGame] = useState('werewolf');

  return (
    <GameLayout activeGame={activeGame} onGameChange={setActiveGame}>
      {activeGame === 'werewolf' && <WerewolfGame />}
      {activeGame === 'undercover' && <UndercoverGame />}
    </GameLayout>
  );
};

export default GameHub;
