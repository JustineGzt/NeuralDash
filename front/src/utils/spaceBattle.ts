import type { Reward } from '../types/quest';

export type ShipAction = 'attack' | 'defend' | 'evade' | 'overload';

type EnemyArchetype = 'balanced' | 'bulwark' | 'raider';

type ActionIntent = {
  kind: 'none' | 'attack';
  label: string;
  damage: number;
  accuracy: number;
  shieldPierce: number;
  critBonus: number;
};

export type CombatantState = {
  id: string;
  name: string;
  icon: string;
  hull: number;
  maxHull: number;
  shield: number;
  maxShield: number;
  fuel: number;
  maxFuel: number;
  attack: number;
  precision: number;
  evasion: number;
  guardPercent: number;
  evadeChance: number;
  specialCooldown: number;
  specialLabel: string;
  specialCost: number;
};

export type SpaceEnemyProfile = {
  id: string;
  name: string;
  icon: string;
  threat: string;
  description: string;
  rewardCredits: number;
  rewardXp: number;
  archetype: EnemyArchetype;
  hull: number;
  shield: number;
  fuel: number;
  attack: number;
  precision: number;
  evasion: number;
  specialLabel: string;
  specialCost: number;
};

export type SpaceBattleState = {
  active: boolean;
  enemyId: string;
  enemyName: string;
  enemyThreat: string;
  enemyDescription: string;
  shipName: string;
  player: CombatantState;
  enemy: CombatantState;
  currentAction: ShipAction | null;
  enemyAction: ShipAction | null;
  battleLog: string[];
  turn: number;
  winner: 'player' | 'enemy' | null;
  rewardCredits: number;
  rewardXp: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const roll = (chance: number) => Math.random() * 100 <= chance;

const ATTACK_COST = 14;
const DEFEND_COST = 8;
const EVADE_COST = 6;
const DEFAULT_SPECIAL_COST = 28;
const SPECIAL_COOLDOWN_TURNS = 3;
const END_TURN_FUEL_REGEN = 6;

const RARITY_BASE_STATS: Record<Reward['rarity'], Omit<CombatantState, 'id' | 'name' | 'icon' | 'guardPercent' | 'evadeChance' | 'specialCooldown' | 'specialLabel' | 'specialCost'>> = {
  common: {
    hull: 100,
    maxHull: 100,
    shield: 32,
    maxShield: 32,
    fuel: 92,
    maxFuel: 92,
    attack: 17,
    precision: 68,
    evasion: 12,
  },
  rare: {
    hull: 112,
    maxHull: 112,
    shield: 40,
    maxShield: 40,
    fuel: 100,
    maxFuel: 100,
    attack: 19,
    precision: 72,
    evasion: 14,
  },
  epic: {
    hull: 124,
    maxHull: 124,
    shield: 48,
    maxShield: 48,
    fuel: 108,
    maxFuel: 108,
    attack: 22,
    precision: 76,
    evasion: 16,
  },
};

export const SPACE_ENEMIES: SpaceEnemyProfile[] = [
  {
    id: 'orion',
    name: 'Escouade Orion',
    icon: '🚀',
    threat: 'Moderee',
    description: 'Escouade polyvalente, bonne cadence de feu et discipline tactique.',
    rewardCredits: 55,
    rewardXp: 28,
    archetype: 'balanced',
    hull: 104,
    shield: 42,
    fuel: 96,
    attack: 19,
    precision: 73,
    evasion: 14,
    specialLabel: 'Rafale Orion',
    specialCost: 24,
  },
  {
    id: 'nebula',
    name: 'Garde Nebula',
    icon: '🛡️',
    threat: 'Elevee',
    description: 'Cellule defensive lourde, absorbe les salves et epuise l adversaire.',
    rewardCredits: 72,
    rewardXp: 36,
    archetype: 'bulwark',
    hull: 132,
    shield: 68,
    fuel: 88,
    attack: 17,
    precision: 70,
    evasion: 10,
    specialLabel: 'Mur Nebulaire',
    specialCost: 22,
  },
  {
    id: 'vesper',
    name: 'Fregate Vesper',
    icon: '🛸',
    threat: 'Critique',
    description: 'Intercepteur rapide, mise sur la vitesse et les frappes opportunistes.',
    rewardCredits: 96,
    rewardXp: 48,
    archetype: 'raider',
    hull: 92,
    shield: 34,
    fuel: 118,
    attack: 24,
    precision: 80,
    evasion: 24,
    specialLabel: 'Lance Vesper',
    specialCost: 26,
  },
];

const getShipSpecial = (ship: Reward) => {
  if (ship.name.includes('Helios')) {
    return { label: 'Rayon Helios', cost: 28 };
  }
  if (ship.name.includes('Nyx')) {
    return { label: 'Voile Nyx', cost: 24 };
  }
  if (ship.name.includes('Axiom')) {
    return { label: 'Salve Axiom', cost: 30 };
  }
  return { label: 'Surcharge Plasma', cost: DEFAULT_SPECIAL_COST };
};

const applyShipBonus = (
  stats: Omit<CombatantState, 'id' | 'name' | 'icon' | 'guardPercent' | 'evadeChance' | 'specialCooldown' | 'specialLabel' | 'specialCost'>,
  label: string,
  value: number
) => {
  const normalizedLabel = label.trim().toLowerCase();

  if (normalizedLabel.includes('attaque')) {
    stats.attack += Math.round(value * 0.32);
  }

  if (normalizedLabel.includes('bouclier')) {
    const shieldBonus = Math.round(value * 0.75);
    stats.maxShield += shieldBonus;
    stats.shield += shieldBonus;
  }

  if (normalizedLabel.includes('defense')) {
    const hullBonus = Math.round(value * 0.7);
    const shieldBonus = Math.round(value * 0.35);
    stats.maxHull += hullBonus;
    stats.hull += hullBonus;
    stats.maxShield += shieldBonus;
    stats.shield += shieldBonus;
  }

  if (normalizedLabel.includes('vitesse')) {
    stats.evasion += Math.round(value * 0.45);
    stats.maxFuel += Math.round(value * 0.3);
    stats.fuel = stats.maxFuel;
  }

  if (normalizedLabel.includes('precision')) {
    stats.precision += Math.round(value * 0.45);
  }

  if (
    normalizedLabel.includes('scan') ||
    normalizedLabel.includes('signal') ||
    normalizedLabel.includes('transmission')
  ) {
    stats.precision += Math.round(value * 0.35);
    stats.attack += Math.round(value * 0.12);
  }
};

const parseShipBonuses = (
  desc: string | undefined,
  stats: Omit<CombatantState, 'id' | 'name' | 'icon' | 'guardPercent' | 'evadeChance' | 'specialCooldown' | 'specialLabel' | 'specialCost'>
) => {
  if (!desc) return;

  const segments = desc.split('|');
  segments.forEach((segment) => {
    const match = segment.match(/(.+?)\s*\+(\d+)%/);
    if (!match) return;
    const [, label, rawValue] = match;
    applyShipBonus(stats, label, Number(rawValue));
  });
};

export const getShipCombatant = (ship: Reward): CombatantState => {
  const base = { ...RARITY_BASE_STATS[ship.rarity] };
  parseShipBonuses(ship.desc, base);

  const special = getShipSpecial(ship);

  return {
    id: ship.id,
    name: ship.name,
    icon: ship.icon,
    hull: base.maxHull,
    maxHull: base.maxHull,
    shield: base.maxShield,
    maxShield: base.maxShield,
    fuel: base.maxFuel,
    maxFuel: base.maxFuel,
    attack: base.attack,
    precision: clamp(base.precision, 50, 96),
    evasion: clamp(base.evasion, 8, 38),
    guardPercent: 0,
    evadeChance: 0,
    specialCooldown: 0,
    specialLabel: special.label,
    specialCost: special.cost,
  };
};

const getEnemyProfile = (enemyId: string) => {
  return SPACE_ENEMIES.find((enemy) => enemy.id === enemyId) ?? null;
};

const createEnemyCombatant = (enemy: SpaceEnemyProfile): CombatantState => {
  return {
    id: enemy.id,
    name: enemy.name,
    icon: enemy.icon,
    hull: enemy.hull,
    maxHull: enemy.hull,
    shield: enemy.shield,
    maxShield: enemy.shield,
    fuel: enemy.fuel,
    maxFuel: enemy.fuel,
    attack: enemy.attack,
    precision: enemy.precision,
    evasion: enemy.evasion,
    guardPercent: 0,
    evadeChance: 0,
    specialCooldown: 0,
    specialLabel: enemy.specialLabel,
    specialCost: enemy.specialCost,
  };
};

export const createSpaceBattle = (ship: Reward, enemyId: string): SpaceBattleState | null => {
  const enemyProfile = getEnemyProfile(enemyId);
  if (!enemyProfile) return null;

  const player = getShipCombatant(ship);
  const enemy = createEnemyCombatant(enemyProfile);

  return {
    active: true,
    enemyId: enemyProfile.id,
    enemyName: enemyProfile.name,
    enemyThreat: enemyProfile.threat,
    enemyDescription: enemyProfile.description,
    shipName: ship.name,
    player,
    enemy,
    currentAction: null,
    enemyAction: null,
    battleLog: [
      `${ship.name} verrouille ${enemyProfile.name}.`,
      `${enemyProfile.description}`,
    ],
    turn: 1,
    winner: null,
    rewardCredits: enemyProfile.rewardCredits,
    rewardXp: enemyProfile.rewardXp,
  };
};

const chooseEnemyAction = (battle: SpaceBattleState): ShipAction => {
  const enemyProfile = getEnemyProfile(battle.enemyId);
  const enemy = battle.enemy;
  const player = battle.player;
  const enemyHullRatio = enemy.hull / enemy.maxHull;
  const enemyShieldRatio = enemy.maxShield > 0 ? enemy.shield / enemy.maxShield : 0;
  const playerHullRatio = player.hull / player.maxHull;

  if (enemy.specialCooldown === 0 && enemy.fuel >= enemy.specialCost) {
    if (playerHullRatio < 0.45 || Math.random() < 0.18) {
      return 'overload';
    }
  }

  if (!enemyProfile) return 'attack';

  switch (enemyProfile.archetype) {
    case 'bulwark':
      if (enemyShieldRatio < 0.35 && enemy.fuel >= DEFEND_COST) return 'defend';
      if (enemyHullRatio < 0.3 && enemy.fuel >= EVADE_COST) return 'evade';
      return Math.random() < 0.75 ? 'attack' : 'defend';
    case 'raider':
      if (enemy.fuel < 18) return 'evade';
      if (Math.random() < 0.32) return 'evade';
      return 'attack';
    default:
      if (enemyHullRatio < 0.38 && enemy.fuel >= DEFEND_COST && Math.random() < 0.5) return 'defend';
      if (Math.random() < 0.15) return 'evade';
      return 'attack';
  }
};

const prepareAction = (
  actor: CombatantState,
  action: ShipAction,
  log: string[]
): { actor: CombatantState; intent: ActionIntent; resolvedAction: ShipAction } => {
  let nextActor = { ...actor };

  if (action === 'overload' && (actor.specialCooldown > 0 || actor.fuel < actor.specialCost)) {
    return prepareAction(actor, 'attack', log);
  }

  if (action === 'attack') {
    if (actor.fuel < ATTACK_COST) {
      nextActor.fuel = clamp(actor.fuel + 12, 0, actor.maxFuel);
      log.push(`${actor.name} recycle son reacteur et gagne 12 carburant.`);
      return {
        actor: nextActor,
        intent: { kind: 'none', label: 'recycle', damage: 0, accuracy: 0, shieldPierce: 0, critBonus: 0 },
        resolvedAction: 'attack',
      };
    }

    nextActor.fuel -= ATTACK_COST;
    return {
      actor: nextActor,
      intent: {
        kind: 'attack',
        label: 'salve principale',
        damage: actor.attack + randomInt(-3, 4),
        accuracy: actor.precision,
        shieldPierce: 0,
        critBonus: 0,
      },
      resolvedAction: 'attack',
    };
  }

  if (action === 'defend') {
    if (actor.fuel < DEFEND_COST) {
      nextActor.fuel = clamp(actor.fuel + 10, 0, actor.maxFuel);
      log.push(`${actor.name} manque d energie et stabilise ses reserves.`);
      return {
        actor: nextActor,
        intent: { kind: 'none', label: 'stabilisation', damage: 0, accuracy: 0, shieldPierce: 0, critBonus: 0 },
        resolvedAction: 'defend',
      };
    }

    nextActor.fuel = clamp(actor.fuel - DEFEND_COST + 4, 0, actor.maxFuel);
    nextActor.guardPercent = 0.45;
    nextActor.shield = clamp(actor.shield + Math.round(actor.maxShield * 0.24) + 5, 0, actor.maxShield);
    log.push(`${actor.name} renforce ses boucliers et absorbera mieux le prochain impact.`);
    return {
      actor: nextActor,
      intent: { kind: 'none', label: 'bouclier', damage: 0, accuracy: 0, shieldPierce: 0, critBonus: 0 },
      resolvedAction: 'defend',
    };
  }

  if (action === 'evade') {
    if (actor.fuel < EVADE_COST) {
      nextActor.fuel = clamp(actor.fuel + 10, 0, actor.maxFuel);
      log.push(`${actor.name} coupe ses moteurs et regenere du carburant.`);
      return {
        actor: nextActor,
        intent: { kind: 'none', label: 'recuperation', damage: 0, accuracy: 0, shieldPierce: 0, critBonus: 0 },
        resolvedAction: 'evade',
      };
    }

    nextActor.fuel = clamp(actor.fuel - EVADE_COST + 8, 0, actor.maxFuel);
    nextActor.evadeChance = clamp(28 + actor.evasion * 1.1, 28, 60) / 100;
    log.push(`${actor.name} passe en manoeuvre evasive.`);
    return {
      actor: nextActor,
      intent: { kind: 'none', label: 'esquive', damage: 0, accuracy: 0, shieldPierce: 0, critBonus: 0 },
      resolvedAction: 'evade',
    };
  }

  nextActor.fuel -= actor.specialCost;
  nextActor.specialCooldown = SPECIAL_COOLDOWN_TURNS;
  return {
    actor: nextActor,
    intent: {
      kind: 'attack',
      label: actor.specialLabel,
      damage: Math.round(actor.attack * 1.7 + actor.precision * 0.18) + randomInt(0, 6),
      accuracy: actor.precision - 4,
      shieldPierce: 0.35,
      critBonus: 14,
    },
    resolvedAction: 'overload',
  };
};

const resolveIntent = (
  attacker: CombatantState,
  defender: CombatantState,
  intent: ActionIntent,
  log: string[]
) => {
  if (intent.kind !== 'attack') {
    return defender;
  }

  if (defender.evadeChance > 0 && Math.random() < defender.evadeChance) {
    log.push(`${defender.name} esquive ${intent.label}.`);
    return defender;
  }

  const hitChance = clamp(intent.accuracy - defender.evasion * 0.75 + 18, 24, 96);
  if (!roll(hitChance)) {
    log.push(`${attacker.name} manque ${intent.label}.`);
    return defender;
  }

  const critChance = clamp(8 + (attacker.precision - 60) * 0.35 + intent.critBonus, 8, 34);
  let totalDamage = Math.max(1, intent.damage + randomInt(-2, 5));
  const isCritical = roll(critChance);
  if (isCritical) {
    totalDamage = Math.round(totalDamage * 1.4);
  }

  totalDamage = Math.max(1, Math.round(totalDamage * (1 - defender.guardPercent)));

  let nextDefender = { ...defender };
  let remainingDamage = totalDamage;
  let hullDamage = 0;
  let shieldDamage = 0;

  const piercedDamage = Math.min(nextDefender.hull, Math.round(totalDamage * intent.shieldPierce));
  if (piercedDamage > 0) {
    nextDefender.hull -= piercedDamage;
    hullDamage += piercedDamage;
    remainingDamage -= piercedDamage;
  }

  if (remainingDamage > 0 && nextDefender.shield > 0) {
    shieldDamage = Math.min(nextDefender.shield, remainingDamage);
    nextDefender.shield -= shieldDamage;
    remainingDamage -= shieldDamage;
  }

  if (remainingDamage > 0) {
    const directHullDamage = Math.min(nextDefender.hull, remainingDamage);
    nextDefender.hull -= directHullDamage;
    hullDamage += directHullDamage;
  }

  const damageParts = [] as string[];
  if (shieldDamage > 0) {
    damageParts.push(`${shieldDamage} bouclier`);
  }
  if (hullDamage > 0) {
    damageParts.push(`${hullDamage} coque`);
  }

  const criticalText = isCritical ? ' critique' : '';
  log.push(`${attacker.name} touche avec ${intent.label}${criticalText} (${damageParts.join(' / ')}).`);
  return nextDefender;
};

const endTurn = (actor: CombatantState) => {
  const nextActor = { ...actor };
  nextActor.fuel = clamp(nextActor.fuel + END_TURN_FUEL_REGEN, 0, nextActor.maxFuel);
  nextActor.guardPercent = 0;
  nextActor.evadeChance = 0;
  nextActor.specialCooldown = Math.max(0, nextActor.specialCooldown - 1);
  return nextActor;
};

export const resolveSpaceBattleTurn = (
  battle: SpaceBattleState,
  playerAction: ShipAction
): SpaceBattleState => {
  const enemyAction = chooseEnemyAction(battle);
  const turnLog = [`Tour ${battle.turn}`];

  const playerPrepared = prepareAction(battle.player, playerAction, turnLog);
  const enemyPrepared = prepareAction(battle.enemy, enemyAction, turnLog);

  let player = playerPrepared.actor;
  let enemy = enemyPrepared.actor;

  enemy = resolveIntent(player, enemy, playerPrepared.intent, turnLog);
  player = resolveIntent(enemy, player, enemyPrepared.intent, turnLog);

  player = endTurn(player);
  enemy = endTurn(enemy);

  let winner: 'player' | 'enemy' | null = null;
  if (enemy.hull <= 0 && player.hull <= 0) {
    winner = player.shield >= enemy.shield ? 'player' : 'enemy';
  } else if (enemy.hull <= 0) {
    winner = 'player';
  } else if (player.hull <= 0) {
    winner = 'enemy';
  }

  if (winner === 'player') {
    turnLog.push(`${battle.enemyName} tombe hors ligne. Victoire tactique.`);
  }

  if (winner === 'enemy') {
    turnLog.push(`${battle.shipName} subit une rupture critique. Retrait force.`);
  }

  return {
    ...battle,
    active: winner === null,
    player,
    enemy,
    currentAction: playerPrepared.resolvedAction,
    enemyAction,
    battleLog: [...battle.battleLog, ...turnLog].slice(-14),
    turn: battle.turn + 1,
    winner,
  };
};