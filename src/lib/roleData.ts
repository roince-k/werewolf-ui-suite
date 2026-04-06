/**
 * 角色数据中心 — 所有角色的展示信息、分类、技能描述
 * 基于《狼人杀角色阵营完整手册 v1.0》
 */
import type { Role } from '@/store/gameStore';

export type Faction = 'wolf' | 'god' | 'village' | 'neutral';

export interface RoleData {
  label: string;
  emoji: string;
  color: string;         // Tailwind text color
  bg: string;            // Tailwind bg + border
  gradient: string;      // For card flip background
  desc: string;          // Short skill description
  faction: Faction;
  factionLabel: string;
  abilities?: string[];
  limitations?: string[];
  deathSkill?: string;
  winCondition?: string;
  strategies?: string[];
  onlyIn12?: boolean;
  isAdvanced?: boolean;  // Advanced board roles
}

export const ROLE_DATA: Record<Role, RoleData> = {
  // ═══ 好人阵营 — 平民 ═══
  villager: {
    label: '平民', emoji: '👤', color: 'text-muted-foreground',
    bg: 'bg-muted/20 border-muted-foreground/20',
    gradient: 'from-muted/40 via-muted/10 to-background',
    desc: '通过推理找出狼人', faction: 'village', factionLabel: '平民',
    abilities: ['参与白天讨论，分析局势', '投票放逐可疑玩家'],
    winCondition: '放逐所有狼人',
    strategies: ['积极发言分析局势', '跟随预言家逻辑投票', '避免分票'],
  },
  little_sheep: {
    label: '小绵羊', emoji: '🐑', color: 'text-muted-foreground',
    bg: 'bg-muted/20 border-muted-foreground/20',
    gradient: 'from-muted/40 via-muted/10 to-background',
    desc: '无特殊技能，等同于村民', faction: 'village', factionLabel: '平民',
    isAdvanced: true,
    winCondition: '放逐所有狼人',
  },

  // ═══ 好人阵营 — 神职 ═══
  seer: {
    label: '预言家', emoji: '🔮', color: 'text-accent',
    bg: 'bg-accent/10 border-accent/30',
    gradient: 'from-accent/30 via-accent/10 to-background',
    desc: '每晚可查验一名玩家身份', faction: 'god', factionLabel: '神职',
    abilities: ['每晚查验一名玩家的阵营身份', '获知金水（好人）或查杀（狼人）'],
    limitations: ['每晚只能查验一人', '查验隐狼、雪狼时显示为"好人"'],
    winCondition: '放逐所有狼人',
    strategies: ['首日上警起跳', '建立警徽流', '带领好人阵营'],
  },
  witch: {
    label: '女巫', emoji: '🧪', color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
    gradient: 'from-purple-500/30 via-purple-400/10 to-background',
    desc: '持有一瓶解药和一瓶毒药', faction: 'god', factionLabel: '神职',
    abilities: ['解药：救活被狼人击杀的玩家', '毒药：毒杀任意一名玩家'],
    limitations: ['两瓶药不能同一晚使用', '仅首夜可自救', '同守同救=死亡（奶穿）'],
    winCondition: '放逐所有狼人',
    strategies: ['保守用药', '观察发言判断真假', '关键时可起跳带队'],
  },
  hunter: {
    label: '猎人', emoji: '🏹', color: 'text-gold',
    bg: 'bg-gold/10 border-gold/30',
    gradient: 'from-gold/30 via-gold/10 to-background',
    desc: '死亡时可开枪带走一人', faction: 'god', factionLabel: '神职',
    abilities: ['被狼人击杀时可开枪带走一人', '被投票放逐时可开枪'],
    limitations: ['被女巫毒杀不能开枪', '被白狼王自爆带走不能开枪', '被狼美人魅惑殉情不能开枪'],
    winCondition: '放逐所有狼人',
  },
  guard: {
    label: '守卫', emoji: '🛡️', color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    gradient: 'from-blue-500/30 via-blue-400/10 to-background',
    desc: '每晚可守护一名玩家', faction: 'god', factionLabel: '神职',
    abilities: ['每晚守护一名玩家（含自己）', '被守护者免受狼刀'],
    limitations: ['不能连续两晚守护同一人', '同守同救=死亡', '毒药穿透守护'],
    winCondition: '放逐所有狼人', onlyIn12: true,
  },
  idiot: {
    label: '白痴', emoji: '🤡', color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    gradient: 'from-amber-400/30 via-amber-300/10 to-background',
    desc: '被放逐时翻牌自证免死，但失去投票权', faction: 'god', factionLabel: '神职',
    abilities: ['被投票放逐时可翻牌自证身份免除死亡', '翻牌后失去投票权但可继续发言'],
    limitations: ['仅投票放逐可触发', '翻牌后仍可被狼刀杀死'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  knight: {
    label: '骑士', emoji: '⚔️', color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/30',
    gradient: 'from-amber-500/30 via-amber-400/10 to-background',
    desc: '白天可翻牌决斗一名玩家', faction: 'god', factionLabel: '神职',
    abilities: ['白天发言阶段可翻牌决斗一名玩家', '对方是狼人则对方死亡，否则自己死亡'],
    limitations: ['全场只能发动一次', '对隐狼、雪狼决斗视为好人'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  grave_keeper: {
    label: '守墓人', emoji: '⚰️', color: 'text-slate-400',
    bg: 'bg-slate-400/10 border-slate-400/30',
    gradient: 'from-slate-500/30 via-slate-400/10 to-background',
    desc: '每晚获知白天出局玩家的具体身份', faction: 'god', factionLabel: '神职',
    abilities: ['每晚得知前一天投票出局玩家的具体身份'],
    limitations: ['只能获取白天出局信息，夜间死亡无法得知'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  dream_weaver: {
    label: '摄梦人', emoji: '💤', color: 'text-indigo-400',
    bg: 'bg-indigo-400/10 border-indigo-400/30',
    gradient: 'from-indigo-500/30 via-indigo-400/10 to-background',
    desc: '每晚选一名梦游者，免疫夜间伤害', faction: 'god', factionLabel: '神职',
    abilities: ['梦游者当晚免疫所有夜间伤害', '摄梦人死亡时梦游者一并死亡'],
    limitations: ['不能连续两晚选同一人（否则该人死亡）'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  medium: {
    label: '通灵师', emoji: '👻', color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/30',
    gradient: 'from-violet-500/30 via-violet-400/10 to-background',
    desc: '每晚可查验一名死亡玩家的具体身份', faction: 'god', factionLabel: '神职',
    abilities: ['查验已出局玩家的具体角色名称'],
    limitations: ['只能查验已出局玩家'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  magician: {
    label: '魔术师', emoji: '🎩', color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-400/10 border-fuchsia-400/30',
    gradient: 'from-fuchsia-500/30 via-fuchsia-400/10 to-background',
    desc: '每晚可交换两名玩家的号码牌', faction: 'god', factionLabel: '神职',
    abilities: ['交换两名存活玩家号码牌', '当晚对这两名玩家的操作互相转移'],
    limitations: ['不能交换已死亡玩家', '效果仅当晚有效'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  night_watchman: {
    label: '守夜人', emoji: '🕯️', color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/30',
    gradient: 'from-orange-500/30 via-orange-400/10 to-background',
    desc: '以命换命，守护目标存活自己死亡', faction: 'god', factionLabel: '神职',
    abilities: ['每晚选一名玩家夜守', '目标被狼刀时自己替死'],
    limitations: ['无法阻止狼刀，只能以命换命'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  moon_priestess: {
    label: '月夜祭司', emoji: '🌙', color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/30',
    gradient: 'from-cyan-500/30 via-cyan-400/10 to-background',
    desc: '夜间祭祀一名玩家，若为狼人则使其无法行动', faction: 'god', factionLabel: '神职',
    abilities: ['选择一名玩家祭祀', '若目标为狼人则当晚无法刀人'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  bomber: {
    label: '炸弹师', emoji: '💣', color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    gradient: 'from-red-500/30 via-red-400/10 to-background',
    desc: '被投票出局时，所有投票者全部死亡', faction: 'god', factionLabel: '神职',
    abilities: ['被投票出局时触发爆炸', '所有投票给自己的玩家全部死亡'],
    limitations: ['仅投票出局触发', '被狼刀、毒杀等不触发'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  crow: {
    label: '乌鸦', emoji: '🪶', color: 'text-gray-400',
    bg: 'bg-gray-400/10 border-gray-400/30',
    gradient: 'from-gray-500/30 via-gray-400/10 to-background',
    desc: '每晚诅咒一名玩家，次日投票多计一票', faction: 'god', factionLabel: '神职',
    abilities: ['每晚诅咒一名玩家', '被诅咒者次日投票时额外被记一票'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  old_drunkard: {
    label: '老酒鬼', emoji: '🍺', color: 'text-amber-600',
    bg: 'bg-amber-600/10 border-amber-600/30',
    gradient: 'from-amber-600/30 via-amber-500/10 to-background',
    desc: '不会被魅惑，被毒杀/枪杀延迟一天生效', faction: 'god', factionLabel: '神职',
    abilities: ['免疫狼美人魅惑', '被毒杀或被枪杀时延迟一天死亡'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  rooster: {
    label: '大公鸡', emoji: '🐓', color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    gradient: 'from-red-600/30 via-red-500/10 to-background',
    desc: '被狼刀杀死则跳过下一个白天', faction: 'god', factionLabel: '神职',
    abilities: ['被狼人杀死时无法叫醒大家', '跳过一个白天直接进入下一夜'],
    limitations: ['仅狼刀触发，毒杀、投票等不触发'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  penguin: {
    label: '企鹅', emoji: '🐧', color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/30',
    gradient: 'from-sky-500/30 via-sky-400/10 to-background',
    desc: '每晚冰冻一名玩家，使其无法使用技能', faction: 'god', factionLabel: '神职',
    abilities: ['每晚冰冻一名存活玩家', '被冰冻者当晚无法使用任何技能'],
    limitations: ['每晚只能冰冻一人', '对狼人有效（整个狼队无法刀人）'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  bear: {
    label: '熊', emoji: '🐻', color: 'text-amber-700',
    bg: 'bg-amber-700/10 border-amber-700/30',
    gradient: 'from-amber-700/30 via-amber-600/10 to-background',
    desc: '天亮时若相邻玩家有狼人则咆哮', faction: 'god', factionLabel: '神职',
    abilities: ['天亮时若左右相邻玩家中有狼人，上帝宣布咆哮', '无狼人则不咆哮'],
    limitations: ['只能判断相邻玩家', '隐狼、雪狼不触发咆哮'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },
  thick_wolf_skin: {
    label: '厚皮狼', emoji: '🦬', color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    gradient: 'from-emerald-600/30 via-emerald-500/10 to-background',
    desc: '虽叫"狼"但属好人，被猎人击杀需两次', faction: 'god', factionLabel: '神职（好人阵营）',
    abilities: ['被猎人击杀时需两次才能真正死亡'],
    limitations: ['被毒杀、投票出局正常死亡'],
    winCondition: '放逐所有狼人', isAdvanced: true,
  },

  // ═══ 狼人阵营 ═══
  werewolf: {
    label: '狼人', emoji: '🐺', color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    gradient: 'from-destructive/30 via-destructive/10 to-background',
    desc: '夜晚选择一名玩家袭击', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['每晚与狼队友共同击杀一名玩家', '可自刀', '白天可自爆进入黑夜'],
    winCondition: '屠民（平民全灭）或屠神（神职全灭）',
    strategies: ['隐藏身份', '悍跳预言家', '倒钩做身份', '深水隐藏'],
  },
  white_wolf_king: {
    label: '白狼王', emoji: '👑🐺', color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    gradient: 'from-destructive/40 via-gold/10 to-background',
    desc: '可自爆并带走一名玩家', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['夜间与狼人共同刀人', '白天可自爆带走一名玩家'],
    limitations: ['被女巫毒杀不能自爆', '被猎人枪击不能自爆'],
    winCondition: '屠民或屠神', onlyIn12: true,
  },
  wolf_king: {
    label: '狼王', emoji: '🔫🐺', color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    gradient: 'from-destructive/30 via-orange-500/10 to-background',
    desc: '被放逐或被猎人击杀时可开枪带走一人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['被公投出局或被猎人击杀时可开枪带走一人'],
    limitations: ['被女巫毒杀不能开枪', '自爆不能开枪'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  black_wolf_king: {
    label: '黑狼王', emoji: '🖤🐺', color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    gradient: 'from-gray-800/40 via-destructive/10 to-background',
    desc: '被放逐或被猎人击杀时可反击带走一人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['被投票放逐或被猎人击杀时可开枪带走一人'],
    limitations: ['被女巫毒杀、自爆时无法开枪'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  wolf_beauty: {
    label: '狼美人', emoji: '💋🐺', color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/30',
    gradient: 'from-pink-500/30 via-pink-400/10 to-background',
    desc: '每晚魅惑一名玩家，自己死亡时对方殉情', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['每晚魅惑一名存活玩家', '狼美人死亡时被魅惑者殉情'],
    limitations: ['不可自爆、不可自刀', '魅惑对老酒鬼无效'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  hidden_wolf: {
    label: '隐狼', emoji: '🎭🐺', color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    gradient: 'from-destructive/20 via-muted/20 to-background',
    desc: '不与狼队友见面，预言家查验显示好人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['夜间独自行动', '预言家查验显示好人', '不受熊的咆哮检测'],
    limitations: ['无法与狼队友沟通'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  snow_wolf: {
    label: '雪狼', emoji: '❄️🐺', color: 'text-sky-300',
    bg: 'bg-sky-300/10 border-sky-300/30',
    gradient: 'from-sky-300/30 via-sky-200/10 to-background',
    desc: '预言家查验显示好人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['预言家查验显示好人', '不受熊咆哮检测', '其他与普通狼人相同'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  gargoyle: {
    label: '石像鬼', emoji: '🗿', color: 'text-stone-400',
    bg: 'bg-stone-400/10 border-stone-400/30',
    gradient: 'from-stone-500/30 via-stone-400/10 to-background',
    desc: '夜间可查验玩家具体身份，狼人全死后可独立刀人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['夜间不见狼队友', '每晚查验一名玩家具体身份', '其他狼人全死后获得刀人能力'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  mech_wolf: {
    label: '机械狼', emoji: '🤖🐺', color: 'text-zinc-400',
    bg: 'bg-zinc-400/10 border-zinc-400/30',
    gradient: 'from-zinc-500/30 via-zinc-400/10 to-background',
    desc: '首夜学习一名玩家身份，获得其技能', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['首夜学习一名玩家身份', '获得对应角色技能', '仍属于狼人阵营'],
    limitations: ['只能首夜学习一次'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  shadow_lock: {
    label: '禁锢之影', emoji: '⛓️', color: 'text-gray-500',
    bg: 'bg-gray-500/10 border-gray-500/30',
    gradient: 'from-gray-600/30 via-gray-500/10 to-background',
    desc: '每晚禁锢一名玩家，使其无法使用技能', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['每晚禁锢一名存活玩家', '被禁锢者当晚无法使用技能'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  evil_knight: {
    label: '恶灵骑士', emoji: '💀⚔️', color: 'text-red-600',
    bg: 'bg-red-600/10 border-red-600/30',
    gradient: 'from-red-700/30 via-red-600/10 to-background',
    desc: '免疫夜间伤害，被查验/毒杀时反杀对方', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['免疫所有夜间伤害', '被预言家查验时预言家死亡', '被女巫毒杀时女巫死亡'],
    limitations: ['只能通过公投出局'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  blood_apostle: {
    label: '血月使徒', emoji: '🩸', color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    gradient: 'from-red-600/30 via-red-500/10 to-background',
    desc: '自爆后让狼队额外获得一次刀人机会', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['自爆时让狼队额外获得一刀'],
    limitations: ['需场上还有其他狼人存活'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  eclipse_wolf: {
    label: '蚀时狼妃', emoji: '🌑🐺', color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/30',
    gradient: 'from-violet-600/30 via-violet-500/10 to-background',
    desc: '特殊功能狼人，干扰神职或时间能力', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['具体技能依板子规则而定', '通常涉及干扰神职技能'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  wolf_crow: {
    label: '狼鸦之爪', emoji: '🦅🐺', color: 'text-gray-600',
    bg: 'bg-gray-600/10 border-gray-600/30',
    gradient: 'from-gray-700/30 via-gray-600/10 to-background',
    desc: '特殊攻击型狼人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['具体技能依板子规则而定', '通常具有强力攻击能力'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },
  wolf_witch: {
    label: '狼巫', emoji: '🧙🐺', color: 'text-purple-600',
    bg: 'bg-purple-600/10 border-purple-600/30',
    gradient: 'from-purple-700/30 via-purple-600/10 to-background',
    desc: '拥有特殊魔法的狼人', faction: 'wolf', factionLabel: '狼人阵营',
    abilities: ['具体技能依板子规则而定', '通常具有干扰或强化能力'],
    winCondition: '屠民或屠神', isAdvanced: true,
  },

  // ═══ 中立阵营 ═══
  cupid: {
    label: '丘比特', emoji: '💘', color: 'text-pink-500',
    bg: 'bg-pink-500/10 border-pink-500/30',
    gradient: 'from-pink-500/30 via-pink-400/10 to-background',
    desc: '首夜连结两名玩家为情侣', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['首夜指定两名玩家结为情侣', '情侣互知身份，一方死另一方殉情'],
    winCondition: '同阵营情侣随阵营胜负；对立情侣则需其他人全部出局',
    isAdvanced: true,
  },
  lover: {
    label: '情侣', emoji: '💕', color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/30',
    gradient: 'from-pink-400/30 via-pink-300/10 to-background',
    desc: '由丘比特连结，一方死另一方殉情', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['殉情：一方死亡另一方立即死亡'],
    isAdvanced: true,
  },
  thief_master: {
    label: '盗宝大师', emoji: '🏴‍☠️', color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    gradient: 'from-yellow-500/30 via-yellow-400/10 to-background',
    desc: '夜间盗取一名玩家的技能', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['夜间盗取一名存活玩家的技能'],
    winCondition: '好人和狼人存活均≤1人时单独获胜',
    isAdvanced: true,
  },
  wild_child: {
    label: '野孩子', emoji: '🧒', color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/30',
    gradient: 'from-green-500/30 via-green-400/10 to-background',
    desc: '首夜选崇拜对象，对象死亡则变为狼人', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['首夜选择崇拜对象', '崇拜对象存活则为好人阵营', '崇拜对象死亡则变为狼人'],
    isAdvanced: true,
  },
  thief: {
    label: '盗贼', emoji: '🥷', color: 'text-gray-500',
    bg: 'bg-gray-500/10 border-gray-500/30',
    gradient: 'from-gray-500/30 via-gray-400/10 to-background',
    desc: '游戏开始时从额外身份牌中选择身份', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['首夜从额外身份牌中选择一张作为身份'],
    winCondition: '根据最终选择的身份决定',
    isAdvanced: true,
  },
  little_girl: {
    label: '小女孩', emoji: '👧', color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/30',
    gradient: 'from-rose-400/30 via-rose-300/10 to-background',
    desc: '夜间可偷看狼人行动，被发现则死亡', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['夜间与狼人同时睁眼可偷看', '高风险：被狼人发现立即死亡'],
    winCondition: '遵循好人阵营',
    isAdvanced: true,
  },
  shapeshifter: {
    label: '千面人', emoji: '🎭', color: 'text-teal-400',
    bg: 'bg-teal-400/10 border-teal-400/30',
    gradient: 'from-teal-500/30 via-teal-400/10 to-background',
    desc: '可伪装或变形，具体规则依板子而定', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['可改变外貌或身份标识', '具体技能依板子规则而定'],
    isAdvanced: true,
  },
  hate_hunter: {
    label: '憎恶猎人', emoji: '😡🏹', color: 'text-orange-600',
    bg: 'bg-orange-600/10 border-orange-600/30',
    gradient: 'from-orange-600/30 via-orange-500/10 to-background',
    desc: '猎人阵营特殊角色', faction: 'neutral', factionLabel: '中立阵营',
    abilities: ['属于猎人阵营的特殊角色'],
    winCondition: '狼人全灭则猎人阵营获胜',
    isAdvanced: true,
  },
};

/** Wolf roles that see each other at night */
export const WOLF_ROLES: Role[] = ['werewolf', 'white_wolf_king', 'wolf_king', 'black_wolf_king',
  'wolf_beauty', 'snow_wolf', 'mech_wolf', 'shadow_lock', 'evil_knight',
  'blood_apostle', 'eclipse_wolf', 'wolf_crow', 'wolf_witch'];

/** Core roles used in standard boards */
export const CORE_ROLES: Role[] = ['werewolf', 'white_wolf_king', 'seer', 'witch', 'hunter', 'guard', 'villager'];

/** Roles for guess picker (standard game) */
export const GUESS_ROLES: Role[] = ['villager', 'werewolf', 'white_wolf_king', 'seer', 'witch', 'hunter', 'guard'];

/** Role label lookup */
export const ROLE_LABELS: Record<Role, string> = Object.fromEntries(
  Object.entries(ROLE_DATA).map(([k, v]) => [k, v.label])
) as Record<Role, string>;

/** Get faction color class */
export const FACTION_COLORS: Record<Faction, string> = {
  wolf: 'text-destructive border-destructive/30 bg-destructive/5',
  god: 'text-gold border-gold/30 bg-gold/5',
  village: 'text-alive border-alive/30 bg-alive/5',
  neutral: 'text-accent border-accent/30 bg-accent/5',
};

/** Board configurations */
export const BOARD_CONFIGS = [
  {
    name: '9人标准局', subtitle: '预女猎民板',
    description: '适合新手入门的经典配置，无守卫无上警',
    roles: '3狼人 · 1预言家 · 1女巫 · 1猎人 · 3平民',
    details: ['狼人阵营：普通狼人 ×3', '神职阵营：预言家、女巫、猎人', '平民阵营：平民 ×3', '总人数：9人', '游戏时长：约20-30分钟', '无警长竞选、无守卫'],
    nightOrder: '狼人 → 预言家 → 女巫',
  },
  {
    name: '12人标准局', subtitle: '预女猎守板 · 上警局',
    description: '包含守卫、白狼王和警长系统的完整策略体验',
    roles: '3狼人 + 1白狼王 · 1预言家 · 1女巫 · 1猎人 · 1守卫 · 4平民',
    details: ['狼人阵营：普通狼人 ×3 + 白狼王 ×1', '神职阵营：预言家、女巫、猎人、守卫', '平民阵营：平民 ×4', '总人数：12人', '游戏时长：约30-50分钟', '首日白天进行警长竞选'],
    nightOrder: '守卫 → 狼人 → 预言家 → 女巫',
  },
  {
    name: '预女猎白板', subtitle: '白痴板 · 12人',
    description: '4狼配置，包含白痴角色',
    roles: '4狼人 · 1预言家 · 1女巫 · 1猎人 · 1白痴 · 4平民',
    details: ['狼人阵营：普通狼人 ×4', '神职阵营：预言家、女巫、猎人、白痴', '平民阵营：平民 ×4', '总人数：12人'],
    nightOrder: '狼人 → 预言家 → 女巫',
    isAdvanced: true,
  },
  {
    name: '狼美人骑士板', subtitle: '12人进阶',
    description: '含狼美人魅惑和骑士决斗的复杂对局',
    roles: '2狼人 + 1狼美人 · 预言家 · 女巫 · 猎人 · 骑士 · 守卫 · 3平民',
    details: ['狼人阵营：普通狼人 ×2 + 狼美人', '神职阵营：预言家、女巫、猎人、骑士、守卫', '平民阵营：平民 ×3'],
    nightOrder: '守卫 → 狼美人 → 狼人 → 预言家 → 女巫',
    isAdvanced: true,
  },
  {
    name: '机械狼板', subtitle: '12人进阶',
    description: '机械狼首夜学习身份获得技能',
    roles: '3狼人 + 1机械狼 · 通灵师 · 女巫 · 猎人 · 守卫 · 4平民',
    details: ['狼人阵营：普通狼人 ×3 + 机械狼', '神职阵营：通灵师、女巫、猎人、守卫'],
    nightOrder: '守卫 → 机械狼(首夜) → 狼人 → 通灵师 → 预言家 → 女巫',
    isAdvanced: true,
  },
  {
    name: '黑狼王摄梦人板', subtitle: '12人进阶',
    description: '含黑狼王反击和摄梦人梦游机制',
    roles: '3狼人 + 1黑狼王 · 预言家 · 女巫 · 猎人 · 摄梦人 · 4平民',
    details: ['狼人阵营：普通狼人 ×3 + 黑狼王', '神职阵营：预言家、女巫、猎人、摄梦人'],
    nightOrder: '摄梦人 → 狼人 → 预言家 → 女巫',
    isAdvanced: true,
  },
  {
    name: '石像鬼守夜人板', subtitle: '12人进阶',
    description: '含石像鬼查验和守夜人以命换命',
    roles: '3狼人 + 1石像鬼 · 预言家 · 女巫 · 猎人 · 守夜人 · 4平民',
    details: ['狼人阵营：普通狼人 ×3 + 石像鬼', '神职阵营：预言家、女巫、猎人、守夜人'],
    nightOrder: '守夜人 → 狼人 → 石像鬼 → 预言家 → 女巫',
    isAdvanced: true,
  },
];

/** Night action order for quick reference */
export const NIGHT_ORDER_SUMMARY = [
  { board: '9人预女猎', order: '狼人 → 预言家 → 女巫 → 猎人' },
  { board: '12人预女猎守', order: '守卫 → 狼人 → 预言家 → 女巫 → 猎人' },
  { board: '12人预女猎白', order: '狼人 → 预言家 → 女巫 → 猎人' },
  { board: '狼美人骑士', order: '守卫 → 狼美人 → 狼人 → 预言家 → 女巫 → 猎人' },
  { board: '黑狼王摄梦人', order: '摄梦人 → 狼人 → 预言家 → 女巫 → 猎人' },
  { board: '石像鬼守夜人', order: '守夜人 → 狼人 → 石像鬼 → 预言家 → 女巫 → 猎人' },
  { board: '机械狼', order: '守卫 → 机械狼(首夜) → 狼人 → 通灵师 → 预言家 → 女巫 → 猎人' },
];

/** Glossary terms */
export const GLOSSARY = [
  { term: '金水', desc: '预言家查验结果显示为"好人"的玩家' },
  { term: '查杀', desc: '预言家查验结果显示为"狼人"的玩家' },
  { term: '银水', desc: '被女巫解药救活的玩家（大概率好人）' },
  { term: '警徽流', desc: '预言家当选警长后，计划查验的玩家顺序' },
  { term: '悍跳', desc: '狼人假冒预言家身份上警抢警徽' },
  { term: '倒钩', desc: '狼人站边真预言家，隐藏身份' },
  { term: '冲锋', desc: '狼人带头冲票好人' },
  { term: '深水', desc: '狼人隐藏在平民中不暴露' },
  { term: '自刀', desc: '狼人夜间刀自己（战术）' },
  { term: '自爆', desc: '狼人白天主动暴露身份，中断流程' },
  { term: '奶穿', desc: '女巫解药与守卫守护作用于同一人，导致死亡' },
  { term: '狼刀在先', desc: '同时满足好狼获胜条件时，狼人优先获胜' },
  { term: '屠边', desc: '狼人杀死所有平民或所有神职' },
];
