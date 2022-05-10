import { promises as fs } from "fs";
import { resolve } from "path";
import rimraf from "rimraf";

export class FSHelper {
  static resolvePath(...paths: string[]) {
    return resolve(...paths);
  }

  static async validateExistence(path: string) {
    try {
      await fs.access(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  static async createFile(dist: string, content: Buffer | string) {
    await fs.writeFile(dist, content);
  }

  static async readFile(src: string) {
    return await fs.readFile(src);
  }

  static async ensureDir(path: string) {
    const exists = await this.validateExistence(path);
    if (!exists) await fs.mkdir(path);
  }

  static removeDirRecursively(path: string) {
    return new Promise((res, rej) => {
      rimraf(path, error => {
        if (error) rej(error);
        res(true);
      });
    });
  }
}
