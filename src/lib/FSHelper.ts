import { promises as fs } from "fs";
import { resolve, join, sep } from "path";
import rimraf from "rimraf";

export class FSHelper {
  static pathSeparator = sep;

  static joinPath(...paths: string[]) {
    return join(...paths);
  }

  static resolvePath(...paths: string[]) {
    return resolve(...paths);
  }

  static createFile(dist: string, content: Buffer | string = "") {
    return fs.writeFile(dist, content);
  }

  static async validateExistence(path: string) {
    try {
      await fs.access(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  static readFile(src: string, options?: Parameters<typeof fs.readFile>[1]) {
    return fs.readFile(src, options);
  }

  static removeFile(src: string) {
    return fs.unlink(src);
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