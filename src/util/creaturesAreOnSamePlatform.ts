import { Creature } from "../models/creatures/Creature";

export const creaturesAreOnSamePlatform = (
  unit1: Creature,
  unit2: Creature,
  fallbackToLastPlatform = false
): boolean => {
  const platform1 = unit1.getPlatform(fallbackToLastPlatform)?.getId() ?? -1;
  const platform2 = unit2.getPlatform(fallbackToLastPlatform)?.getId() ?? -2;

  return platform1 === platform2;
};
