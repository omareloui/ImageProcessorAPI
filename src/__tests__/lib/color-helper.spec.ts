import { ColorHelper } from "../../lib";

describe("Color helper", () => {
  it("should generate a hex color with 7 string value", () => {
    const color = ColorHelper.generateRandom();
    expect(color.length).toBe(7);
  });

  it("should match the hex color pattern", () => {
    const color = ColorHelper.generateRandom();
    expect(color).toMatch(/^#[\dA-F]{6}$/);
  });

  it("should generate two different colors when called twice", () => {
    const colorOne = ColorHelper.generateRandom();
    const colorTwo = ColorHelper.generateRandom();
    expect(colorOne).not.toEqual(colorTwo);
  });
});
