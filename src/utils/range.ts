export function range(start: number, end: number, step = 1) {
  return {
    [Symbol.iterator]() {
      return this;
    },

    next() {
      if (start >= end + 1) return { value: start, done: true };

      const value = start;
      start += step;
      return { value, done: false };
    },
  };
}
