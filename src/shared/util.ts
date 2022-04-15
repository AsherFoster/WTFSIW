export function assertNever(n: never): never {
  return n;
}

/** Randomly pick a item from `src`, biased towards the start */
export function weightedSample<T>(src: T[]): T {
  // TODO confirm this curve
  const weightedRandom = Math.floor(
    src.length - Math.sqrt(Math.random() * src.length ** 2)
  );

  return src[weightedRandom];
}

/** Randomly pick `n` items from `src` */
export function sample<T>(src: T[], n: number): T[] {
  const arr = [...src];
  const sampled = [];

  for (let i = 0; i < n && arr.length; i++) {
    const random = Math.floor(Math.random() * arr.length);
    sampled.push(arr[random]);
    arr.splice(random, 1);
  }

  return sampled;
}

export function pick<T>(src: T[]): T {
  return src[Math.floor(Math.random() * src.length)];
}
