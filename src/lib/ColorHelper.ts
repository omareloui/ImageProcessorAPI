import { range } from "../utils";

export class ColorHelper {
  private static hex = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];

  static generateRandom() {
    let color = "";
    for (const _i of range(0, 5)) color += this.getRandomHex();
    return `#${color.toUpperCase()}`;
  }

  // ====== utils ====== //
  private static getRandomHex() {
    const randomIndex = Math.floor(Math.random() * Math.floor(this.hex.length));
    return this.hex[randomIndex];
  }
}
