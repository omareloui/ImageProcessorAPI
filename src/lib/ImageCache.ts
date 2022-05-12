import { ImagePlaceholderOptions, OperateImageOptions } from "../@types";
import { FSHelper } from "./FSHelper";

export class ImageCache {
  static async cache(
    cacheDir: string,
    options: OperateImageOptions | ImagePlaceholderOptions,
    image: Buffer
  ) {
    const dist = this.getPath(cacheDir, options);
    await FSHelper.ensureDir(cacheDir);
    await FSHelper.createFile(dist, image);
  }

  static async get(
    cacheDir: string,
    options: OperateImageOptions | ImagePlaceholderOptions
  ): Promise<Buffer | false> {
    const src = this.getPath(cacheDir, options);
    const exists = await FSHelper.validateExistence(src);
    if (exists) return (await FSHelper.readFile(src)) as Buffer;
    return false;
  }

  static getPath(
    cacheDir: string,
    options: OperateImageOptions | ImagePlaceholderOptions
  ) {
    const name = this.generateFilename(options);
    return FSHelper.resolvePath(cacheDir, name);
  }

  // prettier-ignore
  static generateFilename<T extends OperateImageOptions & ImagePlaceholderOptions>({
    filename,
    filetype,
    height,
    width,
    rotate,

    flip,
    flop,
    grayscale,
    negate,

    blur,
    median,

    color,
  }: Partial<T>) {
    if (!filename) filename = "not_set_name";

    let name = `${FSHelper.removeExtension(filename)}_`;

    if (width) name += width;
    if (height) name += `x${height}`;
    if (rotate) name += `_r${rotate}`;

    if (flip) name += "_fx";
    if (flop) name += "_fy";
    if (grayscale) name += "_g";
    if (negate) name += "_n";

    if (blur) {
      name += "_b";
      if (typeof blur === "number") name += `${blur}`;
    }
    if (median) {
      name += "_m";
      if (typeof median === "number") name += `${median}`;
    }

    if (color) name += `_c${color}`;

    name = FSHelper.replaceExtension(name, filetype as string);

    return FSHelper.sanitizeFilename(name);
  }
}
