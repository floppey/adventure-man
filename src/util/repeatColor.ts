export const repeatColor = (
  color: string | null,
  times: number
): (string | null)[] => {
  return Array.from({ length: times }).map(() => color);
};
