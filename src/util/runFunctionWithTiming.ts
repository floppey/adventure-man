export const runFunctionWithTiming = <T>(
  fn: () => T,
  functionName: string,
  threshold: number = 10
): T => {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const runTime = endTime - startTime;
  if (runTime > threshold) {
    console.log(`${functionName} took ${endTime - startTime}ms to run`);
  }
  return result;
};
