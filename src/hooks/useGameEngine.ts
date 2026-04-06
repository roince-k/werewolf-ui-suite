import { useCallback, useRef } from 'react';
import { useGameStore, type Role, type GamePhase, type Player } from '@/store/gameStore';
import { toast } from 'sonner';
import { ROLE_LABELS, WOLF_ROLES, ROLE_DATA } from '@/lib/roleData';

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

/** Get the god roles present in the current game */
function getGodRoles(players: Player[]): Player[] {
  return players.filter(p => p.status === 'alive' && p.role && ROLE_DATA[p.role].faction === 'god');
}

/** Get civilian roles (village faction) */
function getCivilianRoles(players: Player[]): Player[] {
  return players.filter(p => p.status === 'alive' && p.role && ROLE_DATA[p.role].faction === 'village');
}

/** Generate contextual AI speech based on role and game state */
function generateAISpeech(player: Player, dayNum: number, alivePlayers: Player[]): string {
  const role = player.role;
  const isWolf = role && WOLF_ROLES.includes(role);
  const aliveCount = alivePlayers.length;

  // Wolf speeches - try to blend in
  if (isWolf) {
    const wolfSpeeches = [
      '我觉得大家应该冷静分析，不要被带节奏。我这边没有什么特殊信息。',
      '昨晚的死亡信息很可疑，我建议大家重点关注发言逻辑。',
      '我是好人，我没有理由骗大家。请相信我的分析。',
      '目前局势不太明朗，我倾向于先观察一轮再做判断。',
      '我觉得有些人的发言太急了，是不是在急着甩锅？',
      '我站在好人的立场上分析，我认为我们应该集中票型。',
    ];
    return wolfSpeeches[Math.floor(Math.random() * wolfSpeeches.length)];
  }

  // Role-specific speeches
  switch (role) {
    case 'seer':
      return dayNum === 1
        ? '我有重要信息要和大家分享，请认真听我的分析。'
        : '根据我掌握的信息，我对当前局势有了新的判断。';
    case 'witch':
      return '昨晚的情况我了解一些，大家注意听我的分析。';
    case 'hunter':
      return '大家放心投，我有底牌在手。我们要精准打击可疑目标。';
    case 'guard':
      return '昨晚我有行动，请大家配合分析局势。';
    case 'idiot':
      return '大家不要急着投我，我有办法自证身份。';
    case 'knight':
      return '如果有人敢和我对质，我随时可以翻牌。';
    default: {
      const civilianSpeeches = [
        '我是好人，虽然没有特殊技能，但我一直在认真分析。',
        '根据目前的发言，我觉得有几个位置比较可疑。',
        '大家的发言我都在听，我建议集中票型打一个位置。',
        '我觉得场上的局势比较紧张，我们需要仔细分析。',
        '有些玩家的发言前后矛盾，值得重点关注。',
        '我建议大家多听少说，注意观察每个人的发言逻辑。',
      ];
      return civilianSpeeches[Math.floor(Math.random() * civilianSpeeches.length)];
    }
  }
}

/** Generate AI last words based on role */
function generateLastWords(player: Player): string {
  const role = player.role;
  const isWolf = role && WOLF_ROLES.includes(role);

  if (isWolf) {
    const wolfLastWords = [
      '好吧，你们赢了这一局。但下次不会这么容易了！',
      '我走了，希望我的队友能帮我报仇。',
      '没想到这么快就暴露了，大家好厉害。',
    ];
    return wolfLastWords[Math.floor(Math.random() * wolfLastWords.length)];
  }

  switch (role) {
    case 'seer':
      return '我是预言家！请大家记住我的查验信息，不要浪费了！';
    case 'witch':
      return '我是女巫，我的药已经用完了。请大家注意安全。';
    case 'hunter':
      return '我是猎人，让我带走一个可疑目标！';
    case 'guard':
      return '我是守卫，我一直在保护大家。请大家找出真凶。';
    default:
      return '我是好人，你们投错了！希望你们能找到真正的狼人。';
  }
}

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

    // Guard phase (12-player, acts first per rule)
    if (is12) {
      const guard = alivePlayers.find(p => p.role === 'guard');
      if (guard) {
        addLog('system', '🛡️ 守卫请睁眼，请选择要守护的玩家...');
        useGameStore.setState({ gamePhase: 'night_guard' });
        await delay(2000);
        if (guard.isAI) {
          const guardTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          addLog('system', '守卫已完成守护');
        } else {
          addLog('system', '等待守卫行动...');
          await delay(1500);
        }
      }
    }

    // Werewolf phase
    await delay(800);
    addLog('system', '🐺 狼人请睁眼，请选择今晚的猎杀目标...');
    useGameStore.setState({ gamePhase: 'night_werewolf' });

    // Show wolf teammates info in log
    if (wolves.length > 1) {
      const wolfNames = wolves.map(w => `${w.number}号${w.name}`).join('、');
      addLog('system', `狼人同伴：${wolfNames}`);
    }

    await delay(2000);

    // AI wolves choose a target (random non-wolf)
    const wolfTarget = nonWolves[Math.floor(Math.random() * nonWolves.length)];
    if (wolfTarget) {
      addLog('system', '狼人已选择目标');
    }

    // Seer phase
    const seer = alivePlayers.find((p) => p.role === 'seer');
    if (seer) {
      addLog('system', '🔮 预言家请睁眼，请选择要查验的玩家...');
      useGameStore.setState({ gamePhase: 'night_seer' });
      await delay(2000);

      if (seer.isAI) {
        const seerTarget = alivePlayers.filter((p) => p.id !== seer.id)[Math.floor(Math.random() * (alivePlayers.length - 1))];
        if (seerTarget) {
          const isWolf = WOLF_ROLES.includes(seerTarget.role!);
          // Hidden wolf and snow wolf show as good
          const showsAsGood = seerTarget.role === 'hidden_wolf' || seerTarget.role === 'snow_wolf';
          const result = (isWolf && !showsAsGood) ? '查杀（狼人）' : '金水（好人）';
          addLog('system', `预言家查验了 ${seerTarget.number}号 — ${result}`);
        }
      } else {
        addLog('system', '等待预言家行动...');
        await delay(1500);
      }
    }

    // Witch phase
    const witch = alivePlayers.find(p => p.role === 'witch');
    if (witch) {
      addLog('system', '🧪 女巫请睁眼...');
      useGameStore.setState({ gamePhase: 'night_witch' });

      if (wolfTarget) {
        addLog('system', `今晚 ${wolfTarget.number}号 ${wolfTarget.name} 被袭击，是否使用解药？`);
      }
      await delay(2000);

      if (witch.isAI) {
        // AI witch: save on first night, random poison later
        if (dayNum === 1 && wolfTarget) {
          addLog('system', '女巫使用了解药');
        } else {
          addLog('system', '女巫选择不用药');
        }
      } else {
        addLog('system', '等待女巫行动...');
        await delay(1500);
      }
    }

    addLog('system', '☀️ 天亮了，所有人请睁眼');

    // Resolve night kills
    if (wolfTarget) {
      const updatedPlayers = currentRoom.players.map((p) =>
        p.id === wolfTarget.id ? { ...p, status: 'dead' as const } : p,
      );
      useGameStore.setState({
        currentRoom: { ...currentRoom, players: updatedPlayers },
      });

      const roleEmoji = wolfTarget.role ? ROLE_DATA[wolfTarget.role].emoji : '❓';
      if (dayNum === 1) {
        addLog('death', `† 昨晚 ${wolfTarget.number}号 ${wolfTarget.name} ${roleEmoji} 被袭击，有遗言机会`);
      } else {
        addLog('death', `† 昨晚 ${wolfTarget.number}号 ${wolfTarget.name} ${roleEmoji} 被袭击，无遗言`);
      }

      // Check if victim is hunter — can they shoot?
      if (wolfTarget.role === 'hunter') {
        addLog('system', `🏹 ${wolfTarget.name} 是猎人，被狼人击杀可以开枪！`);
        await delay(1500);
        if (wolfTarget.isAI) {
          const remaining = updatedPlayers.filter(p => p.status === 'alive' && p.id !== wolfTarget.id);
          const hunterTarget = remaining[Math.floor(Math.random() * remaining.length)];
          if (hunterTarget) {
            const finalPlayers = updatedPlayers.map(p =>
              p.id === hunterTarget.id ? { ...p, status: 'dead' as const } : p,
            );
            useGameStore.setState({
              currentRoom: { ...currentRoom, players: finalPlayers },
            });
            addLog('death', `🏹 猎人开枪带走了 ${hunterTarget.number}号 ${hunterTarget.name}`);
          }
        }
      }
    } else {
      addLog('system', '🌙 昨晚是平安夜，无人死亡');
    }
  }, [addLog, delay]);

  // Run sheriff election (12-player, day 1 only)
  const runSheriffElection = useCallback(async () => {
    addLog('sheriff', '⭐ —— 警长竞选开始 ——');
    addLog('system', '请有意愿的玩家报名上警');
    useGameStore.setState({ gamePhase: 'sheriff_election', isPoliceElectionPhase: true });
    await delay(1500);

    const { currentRoom, myPlayerId } = useGameStore.getState();
    if (!currentRoom) return;
    const alivePlayers = currentRoom.players.filter((p) => p.status === 'alive');
    const aiCandidates = alivePlayers
      .filter((p) => p.isAI)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, alivePlayers.length - 1));

    aiCandidates.forEach((p) => {
      const roleData = p.role ? ROLE_DATA[p.role] : null;
      addLog('sheriff', `⭐ ${p.number}号 ${p.name} ${roleData?.emoji || ''} 申请上警`);
    });

    addLog('system', '等待玩家决定是否上警...');
    await delay(3000);

    // Sheriff speech phase
    useGameStore.setState({ gamePhase: 'sheriff_speech' });
    addLog('sheriff', '⭐ —— 竞选发言阶段 ——');
    
    for (const c of aiCandidates) {
      await delay(1500);
      const speeches = [
        '我认为自己能带领好人阵营走向胜利，请投我一票！',
        '我有重要信息，当选警长后会和大家分享。请支持我！',
        '我会公正地安排发言顺序，帮助大家找出狼人。投我！',
      ];
      addLog('speech', speeches[Math.floor(Math.random() * speeches.length)], c.number, c.name);
    }

    // Sheriff vote phase
    await delay(1000);
    useGameStore.setState({ gamePhase: 'sheriff_vote' });
    addLog('sheriff', '⭐ —— 竞选投票阶段 ——');
    await delay(2000);

    const allCandidates = aiCandidates;
    if (allCandidates.length > 0) {
      const elected = allCandidates[Math.floor(Math.random() * allCandidates.length)];
      useGameStore.setState({ sheriffId: elected.number });
      
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
      addLog('sheriff', '⭐ 无人上警，警长流拍');
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

    // AI speeches with role-aware content
    for (const p of alivePlayers) {
      if (p.isAI) {
        await delay(1200 + Math.random() * 800);
        const speech = generateAISpeech(p, dayNum, alivePlayers);
        addLog('speech', speech, p.number, p.name);
      }
    }

    // If 12-player mode, show wolf explode option
    const is12 = currentRoom.maxPlayers === 12;
    if (is12) {
      useGameStore.setState({ gamePhase: 'day_wolf_explode_available', wolfExplodeAvailable: true });
    }

    addLog('system', '💬 发言阶段，请自由讨论');
    await delay(3000);
  }, [addLog, delay]);

  // Run voting phase
  const runVotingPhase = useCallback(async () => {
    const { currentRoom, sheriffId } = useGameStore.getState();
    if (!currentRoom) return;

    addLog('phase', '—— ⚔️ 投票阶段 ——');
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
        voteLog.push(`${p.number}号→${target.number}号${p.isSheriff ? '(⭐1.5票)' : ''}`);
      }
    }

    addLog('system', '⏳ 等待你的投票...');
    await delay(3000);

    // Tally votes and find max
    addLog('vote_result', `📊 投票结果：${voteLog.join('，')}`);

    const maxVotes = Math.max(...Object.values(voteResults), 0);
    const eliminated = Object.entries(voteResults).find(([, v]) => v === maxVotes);

    if (eliminated) {
      const elimNum = parseInt(eliminated[0]);
      const elimPlayer = currentRoom.players.find((p) => p.number === elimNum);

      if (elimPlayer) {
        const updatedPlayers = currentRoom.players.map((p) =>
          p.number === elimNum ? { ...p, status: 'dead' as const } : p,
        );
        useGameStore.setState({
          currentRoom: { ...currentRoom, players: updatedPlayers },
        });

        const roleLabel = elimPlayer.role ? ROLE_LABELS[elimPlayer.role] : '未知';
        const roleEmoji = elimPlayer.role ? ROLE_DATA[elimPlayer.role].emoji : '❓';
        addLog('execution', `✗ ${elimNum}号 ${elimPlayer.name} 被投票出局 — 身份：${roleEmoji} ${roleLabel}`);

        // Check if hunter triggers (can shoot when voted out)
        if (elimPlayer.role === 'hunter') {
          addLog('system', `🏹 ${elimPlayer.name} 是猎人，被投票出局可以开枪！`);
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

        // Wolf king (狼王) can also shoot when voted out
        if (elimPlayer.role === 'wolf_king' || elimPlayer.role === 'black_wolf_king') {
          const roleName = ROLE_LABELS[elimPlayer.role];
          addLog('system', `🔫 ${elimPlayer.name} 是${roleName}，被投票出局可以开枪！`);
          await delay(1500);
          if (elimPlayer.isAI) {
            const remaining = updatedPlayers.filter((p) => p.status === 'alive' && p.id !== elimPlayer.id);
            const target = remaining[Math.floor(Math.random() * remaining.length)];
            if (target) {
              const finalPlayers = updatedPlayers.map((p) =>
                p.id === target.id ? { ...p, status: 'dead' as const } : p,
              );
              useGameStore.setState({
                currentRoom: { ...currentRoom, players: finalPlayers },
              });
              addLog('death', `🔫 ${roleName}开枪带走了 ${target.number}号 ${target.name}`);
            }
          }
        }

        // Idiot (白痴) can flip card to survive
        if (elimPlayer.role === 'idiot') {
          addLog('system', `🤡 ${elimPlayer.name} 是白痴，翻牌自证身份！免除死亡，但失去投票权`);
          // Restore alive but mark as lost vote
          const restoredPlayers = updatedPlayers.map((p) =>
            p.number === elimNum ? { ...p, status: 'alive' as const } : p,
          );
          useGameStore.setState({
            currentRoom: { ...currentRoom, players: restoredPlayers },
          });
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
        useGameStore.setState({ gamePhase: 'last_words' });
        addLog('system', `📜 ${elimPlayer.name} 的遗言时间`);
        await delay(2000);
        if (elimPlayer.isAI) {
          const lastWords = generateLastWords(elimPlayer);
          addLog('speech', lastWords, elimNum, elimPlayer.name);
        }
        await delay(1500);
      }
    } else {
      addLog('system', '⚖️ 投票平票，本轮无人出局');
    }
  }, [addLog, delay]);

  // Check victory conditions (supports all role factions)
  const checkVictory = useCallback((): { winner: 'village' | 'werewolf'; victoryCondition?: any; mvp?: number } | null => {
    const { currentRoom } = useGameStore.getState();
    if (!currentRoom) return null;

    const alive = currentRoom.players.filter((p) => p.status === 'alive');
    const wolves = alive.filter((p) => p.role && WOLF_ROLES.includes(p.role));
    const gods = alive.filter((p) => p.role && ROLE_DATA[p.role].faction === 'god');
    const civilians = alive.filter((p) => p.role && ROLE_DATA[p.role].faction === 'village');

    // All wolves dead — village wins
    if (wolves.length === 0) {
      // Find MVP: seer who survived, or player with most useful actions
      const seer = currentRoom.players.find(p => p.role === 'seer' && p.status === 'alive');
      return { winner: 'village', victoryCondition: 'village_win', mvp: seer?.number };
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

    const { is12, updatedPlayers } = result;

    // Log role distribution summary
    const wolfCount = updatedPlayers.filter(p => WOLF_ROLES.includes(p.role!)).length;
    const godCount = updatedPlayers.filter(p => p.role && ROLE_DATA[p.role].faction === 'god').length;
    const civilianCount = updatedPlayers.filter(p => p.role && ROLE_DATA[p.role].faction === 'village').length;
    addLog('system', `🎮 游戏开始！阵营分布：🐺 狼人×${wolfCount} · 🛡️ 神职×${godCount} · 👤 平民×${civilianCount}`);

    // Wait for role reveal
    await delay(2500);

    // Game loop - max 5 rounds
    for (let day = 1; day <= 5; day++) {
      currentDayRef.current = day;

      // Night phase
      await runNightPhase(day);

      // Check victory after night
      let victory = checkVictory();
      if (victory) {
        const emoji = victory.winner === 'village' ? '🎉' : '🐺';
        addLog('game_end', `${emoji} ${victory.winner === 'village' ? '好人阵营胜利！所有狼人已被消灭！' : '狼人阵营胜利！村庄已沦陷！'}`);
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
        const emoji = victory.winner === 'village' ? '🎉' : '🐺';
        addLog('game_end', `${emoji} ${victory.winner === 'village' ? '好人阵营胜利！所有狼人已被消灭！' : '狼人阵营胜利！村庄已沦陷！'}`);
        useGameStore.setState({ gameResult: victory, gamePhase: 'ended' });
        return;
      }
    }

    // Safety: end after 5 rounds
    addLog('game_end', '⏰ 游戏达到最大轮数，好人阵营胜利');
    useGameStore.setState({
      gameResult: { winner: 'village', victoryCondition: 'village_win' },
      gamePhase: 'ended',
    });
  }, [clearTimers, assignRoles, runNightPhase, runSheriffElection, runDayPhase, runVotingPhase, checkVictory, addLog, delay]);

  return { startGame, clearTimers };
}
