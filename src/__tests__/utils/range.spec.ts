import { range } from "../../utils";

describe("Range util", () => {
  it("should loop from a range from 0 to 5", () => {
    const arr = [] as number[];

    for (const i of range(0, 5)) {
      arr.push(i);
    }

    expect(arr).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("should loop from a range from 0 to 20 with 5 steps each loop", () => {
    const arr = [] as number[];
    for (const i of range(0, 20, 5)) {
      arr.push(i);
    }
    expect(arr).toEqual([0, 5, 10, 15, 20]);
  });
});
