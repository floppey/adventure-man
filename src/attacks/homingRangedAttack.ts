import { RangedAttack, RangedAttackProps } from "./types";
import { Creature } from "../models/creatures/Creature";
import { rangedAttackAimedAtCreature } from "./rangedAttackAimedAtCreature";

interface HomingRangedAttackProps extends RangedAttackProps {
  target: Creature;
}

export const homingRangedAttack: RangedAttack<HomingRangedAttackProps> = ({
  self,
  target,
  chargePercent,
  colorTheme = "red",
}) => {
  const aimedProjectile = rangedAttackAimedAtCreature({
    self,
    target,
    chargePercent,
    colorTheme,
    projectileType: "homing",
  });

  return aimedProjectile;
};
