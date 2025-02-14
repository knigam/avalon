import { GameState, Player, RoleName } from "@knigam/role-player";
import { avalonRules } from "../src/avalonRules";

test("assignRoles", () => {
  const players: Player[] = [1, 2, 3, 4, 5].map((i) => ({
    id: `${i}`,
    name: `Player ${i}`,
  }));
  const roles: RoleName[] = [];
  const playersWithRoles = avalonRules.assignRoles({ players } as GameState, roles);
  playersWithRoles.forEach((p) => {
    expect(p.role).toBeTruthy();
  });
});
