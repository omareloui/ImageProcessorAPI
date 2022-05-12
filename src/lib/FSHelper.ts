import { promises as fs } from "fs";
import { resolve, join, sep, extname } from "path";
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

  static addExtension(path: string, ext: string) {
    return `${path}.${ext}`;
  }

  static removeExtension(path: string) {
    return path.replace(/\.[^/.]+$/, "");
  }

  static replaceExtension(path: string, newExt: string) {
    const withoutExt = this.removeExtension(path);
    return this.addExtension(withoutExt, newExt);
  }

  static getExtension(path: string) {
    return extname(path).split(".")[1];
  }

  static async scanDirectory(
    dir: string,
    { onlyFiles = false }: { onlyFiles?: boolean } = {}
  ) {
    const dirRead = await fs.readdir(dir);
    if (!onlyFiles) return dirRead;

    const files = [] as string[];

    for (const _file of dirRead) {
      const stat = await fs.stat(this.joinPath(dir, _file));
      if (!stat.isDirectory()) files.push(_file);
    }

    return files;
  }

  static async scanDirectoryRecursively(dir: string, _files: string[] = []) {
    const files = await fs.readdir(dir);

    for (const i in files) {
      const name = this.joinPath(dir, files[i]);
      const stat = await fs.stat(name);

      if (!stat.isDirectory()) {
        _files.push(name);
        continue;
      }

      await this.scanDirectoryRecursively(name, _files);
    }
    return _files;
  }

  static sanitizeFilename(filename: string) {
    return filename.replace(/[^a-z0-9\-_\.]/gi, "_");
  }
}
