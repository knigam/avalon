import { GameState, Player, RoleName } from "@knigam/role-player";
import { avalonRules } from "../src/avalonRules";

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

describe("Avalon Rules", () => {
  describe("Player Count Validation", () => {
    test("should allow valid number of players", () => {
      expect(avalonRules.minPlayers).toBe(MIN_PLAYERS);
      expect(avalonRules.maxPlayers).toBe(MAX_PLAYERS);
    });
  });

  describe("Role Assignment", () => {
    const createPlayers = (count: number): Player[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));
    };

    test("should assign roles to all players", () => {
      const players = createPlayers(5);
      const roles: RoleName[] = [MERLIN, PERCIVAL];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      expect(playersWithRoles).toHaveLength(5);
      playersWithRoles.forEach((p) => {
        expect(p.role).toBeTruthy();
      });
    });

    test("should maintain correct evil/good ratio for 5 players", () => {
      const players = createPlayers(5);
      const roles: RoleName[] = [MERLIN, PERCIVAL];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      const evilCount = playersWithRoles.filter((p) =>
        evilRoles.has(p.role!)
      ).length;
      expect(evilCount).toBe(2);
    });

    test("should maintain correct evil/good ratio for 7 players", () => {
      const players = createPlayers(7);
      const roles: RoleName[] = [MERLIN, PERCIVAL, MORGANA];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      const evilCount = playersWithRoles.filter((p) =>
        evilRoles.has(p.role!)
      ).length;
      expect(evilCount).toBe(3);
    });

    test("should maintain correct evil/good ratio for 10 players", () => {
      const players = createPlayers(10);
      const roles: RoleName[] = [MERLIN, PERCIVAL, MORGANA, MORDRED];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      const evilCount = playersWithRoles.filter((p) =>
        evilRoles.has(p.role!)
      ).length;
      expect(evilCount).toBe(4);
    });

    test("should add minions when not enough evil roles provided", () => {
      const players = createPlayers(5);
      const roles: RoleName[] = [MERLIN, PERCIVAL];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      const minionCount = playersWithRoles.filter(
        (p) => p.role === MINION
      ).length;
      expect(minionCount).toBe(2);
    });

    test("should add loyal servants when needed", () => {
      const players = createPlayers(5);
      const roles: RoleName[] = [MERLIN, PERCIVAL, MORGANA];
      const playersWithRoles = avalonRules.assignRoles(
        { players } as GameState,
        roles
      );

      const servantCount = playersWithRoles.filter(
        (p) => p.role === LSOA
      ).length;
      expect(servantCount).toBe(1); // For 5 players with MERLIN, PERCIVAL, MORGANA, we need 1 LSOA
    });

    test("should assign roles randomly and independently of player order", () => {
      const players = createPlayers(5);
      const roles: RoleName[] = [MERLIN, PERCIVAL, MORGANA];

      // Run multiple assignments with different player orders
      const assignments = Array.from({ length: 100 }, () => {
        // Shuffle the players to ensure order independence
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        const playersWithRoles = avalonRules.assignRoles(
          { players: shuffledPlayers } as GameState,
          roles
        );

        // Create a string representation of the role assignment, sorted by role to ignore order
        return playersWithRoles
          .map((p) => `${p.id}:${p.role}`)
          .sort()
          .join(",");
      });

      // Count unique assignments
      const uniqueAssignments = new Set(assignments);

      // If assignments are random, we should have many different unique assignments
      expect(uniqueAssignments.size).toBeGreaterThan(1);

      // Check that the distribution isn't too skewed
      const assignmentCounts = new Map<string, number>();
      assignments.forEach((assignment) => {
        assignmentCounts.set(
          assignment,
          (assignmentCounts.get(assignment) || 0) + 1
        );
      });

      // No single assignment should occur more than 20% of the time
      const maxOccurrences = Math.max(...assignmentCounts.values());
      expect(maxOccurrences).toBeLessThan(20);

      // Test message order independence
      const messageAssignments = Array.from({ length: 100 }, () => {
        const playersWithRoles = avalonRules.assignRoles(
          { players } as GameState,
          roles
        );
        // Get messages for all roles and sort them to ignore order
        const messages = playersWithRoles
          .map((p) =>
            avalonRules.generateMessageForRole(p.role!, playersWithRoles)
          )
          .sort();
        return messages.join("|");
      });

      // Count unique message combinations
      const uniqueMessageCombinations = new Set(messageAssignments);

      // If message generation is independent of order, we should have many unique combinations
      expect(uniqueMessageCombinations.size).toBeGreaterThan(1);

      // Check message distribution
      const messageCounts = new Map<string, number>();
      messageAssignments.forEach((assignment) => {
        messageCounts.set(assignment, (messageCounts.get(assignment) || 0) + 1);
      });

      // No single message combination should occur too frequently
      const maxMessageOccurrences = Math.max(...messageCounts.values());
      expect(maxMessageOccurrences).toBeLessThan(20);
    });
  });

  describe("Role Messages", () => {
    const createTestPlayers = (): Player[] => [
      { id: "1", name: "Player 1", role: MERLIN },
      { id: "2", name: "Player 2", role: MORGANA },
      { id: "3", name: "Player 3", role: PERCIVAL },
      { id: "4", name: "Player 4", role: MINION },
      { id: "5", name: "Player 5", role: LSOA },
      { id: "6", name: "Player 6", role: OBERON },
      { id: "7", name: "Player 7", role: MORDRED },
    ];

    test("should generate correct message for Merlin", () => {
      const players = createTestPlayers();
      const message = avalonRules.generateMessageForRole(MERLIN, players);
      expect(message).toContain("You are Merlin");
      expect(message).toContain("Player 2 is evil");
      expect(message).toContain("Player 4 is evil");
      expect(message).toContain("Player 6 is evil");
      expect(message).not.toContain("Player 7 is evil");
    });

    test("should generate correct message for Percival", () => {
      const players = createTestPlayers();
      const message = avalonRules.generateMessageForRole(PERCIVAL, players);
      expect(message).toContain("You are Percival");
      expect(message).toContain("Player 1 is Merlin or Morgana");
      expect(message).toContain("Player 2 is Merlin or Morgana");
    });

    test("should generate correct message for evil players (excluding Oberon)", () => {
      const players = createTestPlayers();
      const message = avalonRules.generateMessageForRole(MINION, players);
      expect(message).toContain("You are Minion of Mordred");
      expect(message).toContain("Player 2 is evil");
      expect(message).toContain("Player 4 is evil");
      expect(message).not.toContain("Player 6 is evil");
    });

    test("should generate correct message for Oberon", () => {
      const players = createTestPlayers();
      const message = avalonRules.generateMessageForRole(OBERON, players);
      expect(message).toBe("You are Oberon");
      expect(message).not.toContain("is evil");
    });

    test("should generate correct message for loyal servant", () => {
      const players = createTestPlayers();
      const message = avalonRules.generateMessageForRole(LSOA, players);
      expect(message).toBe("You are a Loyal Servant of Arthur");
    });
  });
});
