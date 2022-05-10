import sharp from "sharp";

import { CreatePlaceholderArguments, ResizeArguments } from "../@types";
import { FSHelper } from ".";
import { ColorHelper } from "./ColorHelper";

export class ImageHelper {
  private static CACHE_DIR = "./images/cache";
  private static PLACEHOLDER_FILENAME = "placeholder.jpg";

  static async createPlaceholder(query: any) {
    const options = this.parseCreatePlaceholderOptions(query);
    this.validateCreatePlaceholderOptions(options);

    const { w, h, color } = options;

    const imageFromCache = await this.getThumbFromCache({
      ...options,
      filename: this.PLACEHOLDER_FILENAME,
    });
    if (imageFromCache) return imageFromCache;

    const newImageBuffer = await sharp({
      create: {
        height: h,
        width: w,
        background: color || ColorHelper.generateRandom(),
        channels: 3,
      },
    })
      .jpeg()
      .toBuffer();

    await this.cacheImage(
      { ...options, filename: this.PLACEHOLDER_FILENAME },
      newImageBuffer
    );

    return newImageBuffer;
  }

  static async resizeImage(query: any) {
    const options = this.parseResizeOptions(query);
    this.validateResizeOptions(options);

    const { filename, w, h } = options;

    const imageSrc = FSHelper.resolvePath(`./images/${filename}`);

    await this.validateImageExistence(imageSrc);

    const imageFromCache = await this.getThumbFromCache(options);
    if (imageFromCache) return imageFromCache;

    const newImageBuffer = await sharp(imageSrc).resize(w, h).toBuffer();

    await this.cacheImage(options, newImageBuffer);

    return newImageBuffer;
  }

  static async removeCache() {
    await FSHelper.removeDirRecursively(this.CACHE_DIR);
  }

  // ====== utils ====== //
  // --- Parse --- //
  private static parseCreatePlaceholderOptions(
    query: any
  ): Partial<CreatePlaceholderArguments> {
    const color = query.color || query.clr;
    const { w, h } = this.parseSize(query);
    return { color, w, h };
  }

  private static parseResizeOptions(query: any): Partial<ResizeArguments> {
    const filename = query.filename || query.file || query.image;
    const { w, h } = this.parseSize(query);
    return { filename, w, h };
  }

  private static parseSize(query: any) {
    const w = query.w || query.width;
    const h = query.h || query.height;

    const width = w ? parseInt(w) : undefined;
    const height = h ? parseInt(h) : undefined;

    return { w: width, h: height };
  }

  // --- Validate --- //
  private static validateCreatePlaceholderOptions(
    options: Partial<CreatePlaceholderArguments>
  ): asserts options is CreatePlaceholderArguments {
    const { w, h } = options;
    if (!w) throw new Error("You have to provide a width.");
    if (!h) throw new Error("You have to provide a height.");
  }

  private static validateResizeOptions(
    options: Partial<ResizeArguments>
  ): asserts options is ResizeArguments {
    const { filename, w, h } = options;
    if (!filename) throw new Error("You have to provide a filename.");
    if (!w && !h) throw new Error("You have to provide a size.");
  }

  private static async validateImageExistence(path: string) {
    const fileExists = await FSHelper.validateExistence(path);
    if (!fileExists) throw new Error("Can't find the required file.");
  }

  // --- Cache --- //
  private static async cacheImage(options: ResizeArguments, image: Buffer) {
    const dist = this.getThumbPath(options);
    await FSHelper.ensureDir(this.CACHE_DIR);
    await FSHelper.createFile(dist, image);
  }

  private static async getThumbFromCache(options: ResizeArguments) {
    const src = this.getThumbPath(options);
    const exists = await FSHelper.validateExistence(src);
    if (exists) return FSHelper.readFile(src);
    return false;
  }

  private static getThumbPath({ w, h, filename }: ResizeArguments) {
    let name = "";
    if (w) name += w;
    if (h) name += `x${h}`;
    name += `_${filename}`;
    return FSHelper.resolvePath(this.CACHE_DIR, name);
  }
}
