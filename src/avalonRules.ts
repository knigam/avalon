import { GameRules, GameState, Player, RoleName } from "@knigam/role-player";
import { shuffle } from "./helper";

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;

const LSOA = "Loyal Servant of Arthur";
const MERLIN = "Merlin";
const PERCIVAL = "Percival";
const MORDRED = "Mordred";
const MINION = "Minion of Mordred";
const MORGANA = "Morgana";
const OBERON = "Oberon";
const ASSASSIN = "Assassin";

const evilRoles = new Set([MORDRED, MINION, MORGANA, OBERON, ASSASSIN]);

const validRoles = new Set([MERLIN, PERCIVAL, MORGANA, ASSASSIN, MORDRED, OBERON]);

function getNumEvilForNumPlayers(numPlayers: number): number {
  if ([5, 6].includes(numPlayers)) {
    return 2;
  }
  if ([7, 8, 9].includes(numPlayers)) {
    return 3;
  }
  if (numPlayers === 10) {
    return 4;
  }
  throw new Error("Invalid number of players");
}

function assignRoles(state: GameState, roles: RoleName[]): Player[] {
  const { players } = state;
  const numEvilRoles = roles.filter((r) => evilRoles.has(r)).length;

  // Make sure there are enough minions
  const requiredEvil = getNumEvilForNumPlayers(players.length);
  for (let i = 0; i < requiredEvil - numEvilRoles; i++) {
    roles.push(MINION);
  }

  // Add loyal servants to ensure number of roles matches number of players
  const requiredGood = players.length - roles.length;
  for (let i = 0; i < requiredGood; i++) {
    roles.push(LSOA);
  }

  const shuffledPlayers = shuffle(players);
  const shuffledRoles = shuffle(roles);

  return shuffledPlayers.map((p, i) => ({
    ...p,
    role: shuffledRoles[i],
  }));
}

function generateMessageForRole(role: RoleName, players: Player[]): string {
  switch (role) {
    case LSOA: {
      return generateMessageForServant();
    }
    case MERLIN: {
      return generateMessageForMerlin(players);
    }
    case PERCIVAL: {
      return generateMessageForPercival(players);
    }
    case MORDRED: {
      return generateMessageForEvilPlayer(MORDRED, players);
    }
    case MORGANA: {
      return generateMessageForEvilPlayer(MORGANA, players);
    }
    case OBERON: {
      return `You are ${OBERON}`;
    }
    case ASSASSIN: {
      return generateMessageForEvilPlayer(ASSASSIN, players);
    }
    case MINION: {
      return generateMessageForEvilPlayer(MINION, players);
    }
    default: {
      throw new Error(`${role} is not a valid role`);
    }
  }
}

function generateMessageForServant(): string {
  return `You are a ${LSOA}`;
}

function generateMessageForMerlin(players: Player[]): string {
  const evilPlayersWithoutMordred = players.filter((p) => p.role && evilRoles.has(p.role) && p.role !== MORDRED);

  return `
  You are ${MERLIN}\n
  ${evilPlayersWithoutMordred.map((p) => `${p.name} is evil`).join("\n")}
  `;
}

function generateMessageForPercival(players: Player[]): string {
  const merlinOrMorgana = players.filter((p) => p.role === MERLIN || p.role === MORGANA);
  return `
  You are ${PERCIVAL}\n
  ${merlinOrMorgana.map((p) => `${p.name} is ${MERLIN} or ${MORGANA}`).join("\n")}
  `;
}

function generateMessageForEvilPlayer(role: RoleName, players: Player[]): string {
  const evilPlayers = players.filter((p) => p.role && evilRoles.has(p.role) && p.role !== OBERON);

  return `You are ${role}\n${evilPlayers.map((p) => `${p.name} is evil`).join("\n")}`;
}

export const avalonRules: GameRules = {
  minPlayers: MIN_PLAYERS,
  maxPlayers: MAX_PLAYERS,
  validRoles: validRoles,
  assignRoles: assignRoles,
  generateMessageForRole: generateMessageForRole,
};
