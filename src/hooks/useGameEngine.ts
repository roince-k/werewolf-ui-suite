import { useCallback, useRef } from 'react';
import { useGameStore, type Role, type GamePhase, type Player } from '@/store/gameStore';
import { toast } from 'sonner';

// Board configurations
const BOARD_9: Role[] = [
  'werewolf', 'werewolf', 'werewolf',
  'seer', 'witch', 'hunter',
  'villager', 'villager', 'villager',
];

const BOARD_12: Role[] = [
  'werewolf', 'werewolf', 'werewolf', 'white_wolf_king',
  'seer', 'witch', 'hunter', 'guard',
  'villager', 'villager', 'villager', 'villager',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

import { ROLE_LABELS, WOLF_ROLES } from '@/lib/roleData';

export function useGameEngine() {
  const store = useGameStore();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const currentDayRef = useRef(1);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms);
      timers.current.push(t);
    });

  const addLog = useCallback(
    (type: Parameters<typeof store.addGameLog>[0]['type'], content: string, playerNumber?: number, playerName?: string) => {
      store.addGameLog({ type, content, playerNumber, playerName });
    },
    [store],
  );

  // Assign roles to all players in the current room
  const assignRoles = useCallback(() => {
    const { currentRoom, myPlayerId } = useGameStore.getState();
    if (!currentRoom) return null;

    const is12 = currentRoom.maxPlayers === 12;
    const board = is12 ? BOARD_12 : BOARD_9;
    const shuffledRoles = shuffle(board);

    const updatedPlayers = currentRoom.players.map((p, i) => ({
      ...p,
      role: shuffledRoles[i] as Role,
    }));

    const myRole = updatedPlayers.find((p) => p.id === myPlayerId)?.role ?? null;

    // Update store
    useGameStore.setState({
      currentRoom: { ...currentRoom, players: updatedPlayers, status: 'playing' },
      myRole,
      showRoleReveal: true,
      gameLogs: [],
      votes: {},
      gameResult: null,
      localGuesses: {},
      sheriffId: null,
      currentDay: 1,
    });

    currentDayRef.current = 1;
    return { updatedPlayers, myRole, is12 };
  }, []);

  // Simulate a full night phase with sub-phases
  const runNightPhase = useCallback(async (dayNum: number) => {
    const { currentRoom } = useGameStore.getState();
    if (!currentRoom) return;
    const is12 = currentRoom.maxPlayers === 12;
    const alivePlayers = currentRoom.players.filter((p) => p.status === 'alive');
    const wolves = alivePlayers.filter((p) => WOLF_ROLES.includes(p.role!));
    const nonWolves = alivePlayers.filter((p) => !WOLF_ROLES.includes(p.role!));

    addLog('phase', `—— 第${dayNum}夜 ——`);
    useGameStore.setState({ gamePhase: 'night', currentDay: dayNum });

    // Werewolf phase
    await delay(800);
    addLog('system', '天黑请闭眼，狼人请睁眼...');
    useGameStore.setState({ gamePhase: 'night_werewolf' });
    await delay(2000);

    // AI wolves choose a target (random non-wolf)
    const wolfTarget = nonWolves[Math.floor(Math.random() * nonWolves.length)];
    if (wolfTarget) {
      addLog('system', '狼人已选择目标');
    }

    // Seer phase
    addLog('system', '狼人请闭眼，预言家请睁眼...');
    useGameStore.setState({ gamePhase: 'night_seer' });
    await delay(2000);

    const seer = alivePlayers.find((p) => p.role === 'seer');
    if (seer?.isAI) {
      const seerTarget = alivePlayers.filter((p) => p.id !== seer.id)[Math.floor(Math.random() * (alivePlayers.length - 1))];
      if (seerTarget) {
        const isWolf = WOLF_ROLES.includes(seerTarget.role!);
        addLog('system', `预言家查验了 ${seerTarget.number}号`);
      }
    }

    // Witch phase
    addLog('system', '预言家请闭眼，女巫请睁眼...');
    useGameStore.setState({ gamePhase: 'night_witch' });
    await delay(2000);
    addLog('system', '女巫已行动');

    // Guard phase (12-player only)
    if (is12) {
      addLog('system', '女巫请闭眼，守卫请睁眼...');
      useGameStore.setState({ gamePhase: 'night_guard' });
      await delay(2000);
      addLog('system', '守卫已行动');
    }

    addLog('system', '天亮了，所有人请睁眼');

    // Resolve night kills
    if (wolfTarget) {
      // Update player status
      const updatedPlayers = currentRoom.players.map((p) =>
        p.id === wolfTarget.id ? { ...p, status: 'dead' as const } : p,
      );
      useGameStore.setState({
        currentRoom: { ...currentRoom, players: updatedPlayers },
      });

      if (dayNum === 1) {
        addLog('death', `† 昨晚 ${wolfTarget.number}号 ${wolfTarget.name} 被袭击，有遗言机会`);
      } else {
        addLog('death', `† 昨晚 ${wolfTarget.number}号 ${wolfTarget.name} 被袭击，无遗言`);
      }
    } else {
      addLog('system', '昨晚是平安夜');
    }
  }, [addLog, delay]);

  // Run sheriff election (12-player, day 1 only)
  const runSheriffElection = useCallback(async () => {
    addLog('sheriff', '🎖️ —— 警长竞选开始 ——');
    useGameStore.setState({ gamePhase: 'sheriff_election', isPoliceElectionPhase: true });
    await delay(1500);

    // Simulate AI candidates
    const { currentRoom, myPlayerId } = useGameStore.getState();
    if (!currentRoom) return;
    const alivePlayers = currentRoom.players.filter((p) => p.status === 'alive');
    const aiCandidates = alivePlayers
      .filter((p) => p.isAI)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, alivePlayers.length - 1));

    aiCandidates.forEach((p) => {
      addLog('sheriff', `🎖️ ${p.number}号 ${p.name} 申请上警`);
    });

    addLog('system', '等待玩家决定是否上警...');
    await delay(3000);

    // Sheriff speech phase
    useGameStore.setState({ gamePhase: 'sheriff_speech' });
    addLog('sheriff', '🎖️ —— 竞选发言阶段 ——');
    
    for (const c of aiCandidates) {
      await delay(1500);
      addLog('speech', `我认为自己能带领好人阵营走向胜利，请投我一票！`, c.number, c.name);
    }

    // Sheriff vote phase
    await delay(1000);
    useGameStore.setState({ gamePhase: 'sheriff_vote' });
    addLog('sheriff', '🎖️ —— 竞选投票阶段 ——');
    await delay(2000);

    // Elect a random candidate as sheriff
    const allCandidates = aiCandidates;
    if (allCandidates.length > 0) {
      const elected = allCandidates[Math.floor(Math.random() * allCandidates.length)];
      useGameStore.setState({ sheriffId: elected.number });
      
      // Update player sheriff status
      const updatedPlayers = currentRoom.players.map((p) =>
        p.number === elected.number
          ? { ...p, isSheriff: true, sheriffVoteWeight: 1.5 }
          : p,
      );
      useGameStore.setState({
        currentRoom: { ...currentRoom, players: updatedPlayers },
      });

      addLog('sheriff', `🎖️ ${elected.number}号 ${elected.name} 当选警长！票权 1.5 票`);
      toast.success(`${elected.number}号 ${elected.name} 当选警长！`);
    } else {
      addLog('sheriff', '🎖️ 无人上警，警长流拍');
    }

    useGameStore.setState({ isPoliceElectionPhase: false });
    await delay(1000);
  }, [addLog, delay]);

  // Run day discussion phase
  const runDayPhase = useCallback(async (dayNum: number) => {
    const { currentRoom } = useGameStore.getState();
    if (!currentRoom) return;

    addLog('phase', `—— 第${dayNum}天 · 讨论阶段 ——`);
    useGameStore.setState({ gamePhase: 'day_discussion' });

    const alivePlayers = currentRoom.players.filter((p) => p.status === 'alive');

    // AI speeches
    for (const p of alivePlayers) {
      if (p.isAI) {
        await delay(1200 + Math.random() * 800);
        const speeches = [
          `我觉得场上的局势比较紧张，我们需要仔细分析昨晚的信息。`,
          `根据目前的情况，我怀疑有人在隐藏自己的身份。`,
          `我建议大家多听少说，注意观察每个人的发言逻辑。`,
          `昨晚的死亡信息很关键，我们要从中寻找线索。`,
          `我认为我们应该集中火力，不要分散票数。`,
          `有些玩家的发言前后矛盾，值得注意。`,
        ];
        addLog('speech', speeches[Math.floor(Math.random() * speeches.length)], p.number, p.name);
      }
    }

    // If 12-player mode, show wolf explode option
    const is12 = currentRoom.maxPlayers === 12;
    if (is12) {
      useGameStore.setState({ gamePhase: 'day_wolf_explode_available', wolfExplodeAvailable: true });
    }

    addLog('system', '发言阶段，请自由讨论');
    await delay(3000);
  }, [addLog, delay]);

  // Run voting phase
  const runVotingPhase = useCallback(async () => {
    const { currentRoom, sheriffId } = useGameStore.getState();
    if (!currentRoom) return;

    addLog('phase', '—— 投票阶段 ——');
    useGameStore.setState({ gamePhase: 'voting', wolfExplodeAvailable: false });

    const alivePlayers = currentRoom.players.filter((p) => p.status === 'alive');
    await delay(2000);

    // AI votes
    const voteResults: Record<number, number> = {};
    const voteLog: string[] = [];

    for (const p of alivePlayers.filter((p) => p.isAI)) {
      const targets = alivePlayers.filter((t) => t.id !== p.id);
      const target = targets[Math.floor(Math.random() * targets.length)];
      if (target) {
        const weight = p.isSheriff ? 1.5 : 1;
        voteResults[target.number] = (voteResults[target.number] || 0) + weight;
        voteLog.push(`${p.number}号→${target.number}号${p.isSheriff ? '(1.5票)' : ''}`);
      }
    }

    addLog('system', '等待你的投票...');
    await delay(3000);

    // Tally votes and find max
    addLog('vote_result', `投票结果：${voteLog.join('，')}`);

    const maxVotes = Math.max(...Object.values(voteResults), 0);
    const eliminated = Object.entries(voteResults).find(([, v]) => v === maxVotes);

    if (eliminated) {
      const elimNum = parseInt(eliminated[0]);
      const elimPlayer = currentRoom.players.find((p) => p.number === elimNum);

      if (elimPlayer) {
        // Update player status
        const updatedPlayers = currentRoom.players.map((p) =>
          p.number === elimNum ? { ...p, status: 'dead' as const } : p,
        );
        useGameStore.setState({
          currentRoom: { ...currentRoom, players: updatedPlayers },
        });

        const roleLabel = elimPlayer.role ? ROLE_LABELS[elimPlayer.role] : '未知';
        addLog('execution', `✗ ${elimNum}号 ${elimPlayer.name} 被投票出局，身份是 ${roleLabel}`);

        // Check if hunter triggers
        if (elimPlayer.role === 'hunter') {
          addLog('system', `🏹 ${elimPlayer.name} 是猎人，可以开枪带走一人！`);
          await delay(1500);
          if (elimPlayer.isAI) {
            const remaining = updatedPlayers.filter((p) => p.status === 'alive' && p.id !== elimPlayer.id);
            const hunterTarget = remaining[Math.floor(Math.random() * remaining.length)];
            if (hunterTarget) {
              const finalPlayers = updatedPlayers.map((p) =>
                p.id === hunterTarget.id ? { ...p, status: 'dead' as const } : p,
              );
              useGameStore.setState({
                currentRoom: { ...currentRoom, players: finalPlayers },
              });
              addLog('death', `🏹 猎人开枪带走了 ${hunterTarget.number}号 ${hunterTarget.name}`);
            }
          }
        }

        // Sheriff transfer on death
        if (elimPlayer.isSheriff) {
          addLog('sheriff', `🎖️ 警长 ${elimPlayer.name} 出局，警徽需要移交或撕毁`);
          if (elimPlayer.isAI) {
            const remaining = updatedPlayers.filter((p) => p.status === 'alive' && p.id !== elimPlayer.id);
            const newSheriff = remaining[Math.floor(Math.random() * remaining.length)];
            if (newSheriff) {
              useGameStore.setState({ sheriffId: newSheriff.number });
              addLog('sheriff', `🎖️ 警徽移交给 ${newSheriff.number}号 ${newSheriff.name}`);
            }
          }
        }

        // Last words
        addLog('system', `${elimPlayer.name} 的遗言时间`);
        useGameStore.setState({ gamePhase: 'last_words' });
        await delay(2000);
        if (elimPlayer.isAI) {
          addLog('speech', '我是好人，你们投错了！希望你们能找到真正的狼人。', elimNum, elimPlayer.name);
        }
        await delay(1500);
      }
    } else {
      addLog('system', '投票平票，本轮无人出局');
    }
  }, [addLog, delay]);

  // Check victory conditions
  const checkVictory = useCallback((): { winner: 'village' | 'werewolf'; victoryCondition?: any } | null => {
    const { currentRoom } = useGameStore.getState();
    if (!currentRoom) return null;

    const alive = currentRoom.players.filter((p) => p.status === 'alive');
    const wolves = alive.filter((p) => WOLF_ROLES.includes(p.role!));
    const gods = alive.filter((p) => ['seer', 'witch', 'hunter', 'guard'].includes(p.role!));
    const civilians = alive.filter((p) => p.role === 'villager');

    // All wolves dead
    if (wolves.length === 0) {
      return { winner: 'village', victoryCondition: 'village_win' };
    }
    // All gods dead (屠神)
    if (gods.length === 0) {
      return { winner: 'werewolf', victoryCondition: 'werewolf_slaughter_gods' };
    }
    // All civilians dead (屠民)
    if (civilians.length === 0) {
      return { winner: 'werewolf', victoryCondition: 'werewolf_slaughter_civilians' };
    }
    // Wolves >= non-wolves
    if (wolves.length >= alive.length - wolves.length) {
      return { winner: 'werewolf', victoryCondition: 'werewolf_win' };
    }

    return null;
  }, []);

  // Main game loop
  const startGame = useCallback(async () => {
    clearTimers();

    const result = assignRoles();
    if (!result) return;

    const { is12 } = result;

    // Wait for role reveal
    await delay(2000);

    // Game loop - max 5 rounds to prevent infinite
    for (let day = 1; day <= 5; day++) {
      currentDayRef.current = day;

      // Night phase
      await runNightPhase(day);

      // Check victory after night
      let victory = checkVictory();
      if (victory) {
        addLog('game_end', victory.winner === 'village' ? '🎉 好人阵营胜利！' : '🐺 狼人阵营胜利！');
        useGameStore.setState({ gameResult: victory, gamePhase: 'ended' });
        return;
      }

      // Sheriff election (12-player, day 1 only)
      if (is12 && day === 1) {
        await runSheriffElection();
      }

      // Day discussion
      await runDayPhase(day);

      // Voting
      await runVotingPhase();

      // Check victory after voting
      victory = checkVictory();
      if (victory) {
        addLog('game_end', victory.winner === 'village' ? '🎉 好人阵营胜利！' : '🐺 狼人阵营胜利！');
        useGameStore.setState({ gameResult: victory, gamePhase: 'ended' });
        return;
      }
    }

    // Safety: end after 5 rounds
    addLog('game_end', '游戏达到最大轮数，结束');
    useGameStore.setState({
      gameResult: { winner: 'village', victoryCondition: 'village_win' },
      gamePhase: 'ended',
    });
  }, [clearTimers, assignRoles, runNightPhase, runSheriffElection, runDayPhase, runVotingPhase, checkVictory, addLog, delay]);

  return { startGame, clearTimers };
}
