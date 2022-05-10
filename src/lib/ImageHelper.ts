import sharp from "sharp";

import {
  ImagePlaceholderOptions,
  ImagePlaceholderReturn,
  ResizeImageOptions,
  ResizeImageReturn,
} from "../@types";
import { FSHelper } from "./FSHelper";
import { ColorHelper } from "./ColorHelper";

interface CacheImagePathOptions {
  filename: string;
  newExt?: string;
  w?: number;
  h?: number;
}

interface CacheOptions {
  shouldCache?: boolean;
  cacheDir?: string;
}

export class ImageHelper {
  static IMAGES_DIR = "./public/images";
  static CACHE_DIR = FSHelper.joinPath(this.IMAGES_DIR, "cache");

  static PLACEHOLDER_FILENAME = "placeholder";
  static PLACEHOLDER_DEFAULT_FILETYPE = "webp" as const;

  static async createPlaceholder(
    query: any,
    { shouldCache = true, cacheDir = this.CACHE_DIR }: CacheOptions = {}
  ): Promise<ImagePlaceholderReturn> {
    const options = this.parseCreatePlaceholderOptions(query);
    this.validateCreatePlaceholderOptions(options);

    const { w, h, color } = options;
    const filetype = this.PLACEHOLDER_DEFAULT_FILETYPE;

    const imageFromCache = await this.getFromCache(cacheDir, {
      ...options,
      filename: FSHelper.addExtension(
        ImageHelper.PLACEHOLDER_FILENAME,
        filetype
      ),
    });
    if (imageFromCache)
      return {
        image: imageFromCache,
        isFromCache: true,
        filetype,
      };

    const newImageBuffer = await sharp({
      create: {
        height: h,
        width: w,
        background: color || ColorHelper.generateRandom(),
        channels: 3,
      },
    })
      .toFormat(filetype)
      .toBuffer();

    if (shouldCache)
      await this.cacheImage(
        cacheDir,
        {
          ...options,
          filename: FSHelper.addExtension(
            ImageHelper.PLACEHOLDER_FILENAME,
            filetype
          ),
        },
        newImageBuffer
      );

    return { image: newImageBuffer, isFromCache: false, filetype };
  }

  static async resize(
    query: any,
    { shouldCache = true, cacheDir = this.CACHE_DIR }: CacheOptions = {}
  ): Promise<ResizeImageReturn> {
    const options = this.parseResizeOptions(query);
    this.validateResizeOptions(options);

    const { filename, w, h, filetype } = options;

    const imageSrc = FSHelper.resolvePath(this.IMAGES_DIR, filename);
    await this.validateImageExistence(imageSrc);

    const imageFromCache = await this.getFromCache(cacheDir, {
      ...options,
      newExt: filetype as string,
      filename,
    });
    if (imageFromCache)
      return {
        image: imageFromCache,
        isFromCache: true,
        filetype: filetype as string,
      };

    const newImageBuffer = await sharp(imageSrc)
      .resize(w, h)
      .toFormat(filetype)
      .toBuffer();

    if (shouldCache)
      await this.cacheImage(
        cacheDir,
        {
          ...options,
          newExt: filetype as string,
          filename,
        },
        newImageBuffer
      );

    return {
      image: newImageBuffer,
      isFromCache: false,
      filetype: filetype as string,
    };
  }

  static removeCache(cacheDir = this.CACHE_DIR) {
    return FSHelper.removeDirRecursively(cacheDir);
  }

  // ====== utils ====== //
  // --- Parse --- //
  private static parseCreatePlaceholderOptions(
    query: any
  ): Partial<ImagePlaceholderOptions> {
    const color = query.color || query.clr;
    const { w, h } = this.parseSize(query);
    return { color, w, h };
  }

  private static parseResizeOptions(query: any): Partial<ResizeImageOptions> {
    const filename = query.filename || query.file || query.image;
    const filetype =
      query.ext ||
      query.extension ||
      query.filetype ||
      query.format ||
      FSHelper.getExtension(filename || "") ||
      "webp";

    const { w, h } = this.parseSize(query);
    return { filename, w, h, filetype };
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
    options: Partial<ImagePlaceholderOptions>
  ): asserts options is ImagePlaceholderOptions {
    const { w, h } = options;
    if (!w) throw new Error("You have to provide a width.");
    if (!h) throw new Error("You have to provide a height.");
  }

  private static validateResizeOptions(
    options: Partial<ResizeImageOptions>
  ): asserts options is ResizeImageOptions {
    const { filename, w, h } = options;
    if (!filename) throw new Error("You have to provide a filename.");
    if (!w && !h) throw new Error("You have to provide a size.");
    if (
      options.filetype &&
      ![...Object.keys(sharp.format), "jpg"].includes(
        options.filetype as string
      )
    )
      throw new Error("You have to provide a valid file format.");
  }

  private static async validateImageExistence(path: string) {
    const fileExists = await FSHelper.validateExistence(path);
    if (!fileExists) throw new Error("Can't find the requested file.");
  }

  // --- Cache --- //
  private static async cacheImage(
    cacheDir: string,
    options: CacheImagePathOptions,
    image: Buffer
  ) {
    const dist = this.getCachedImagePath(cacheDir, options);
    await FSHelper.ensureDir(cacheDir);
    await FSHelper.createFile(dist, image);
  }

  private static async getFromCache(
    cacheDir: string,
    options: CacheImagePathOptions
  ): Promise<Buffer | false> {
    const src = this.getCachedImagePath(cacheDir, options);
    const exists = await FSHelper.validateExistence(src);
    if (exists) return (await FSHelper.readFile(src)) as Buffer;
    return false;
  }

  static getCachedImagePath(
    cacheDir: string,
    { w, h, filename, newExt }: CacheImagePathOptions
  ) {
    let name = "";
    if (w) name += w;
    if (h) name += `x${h}`;
    name += `_${filename}`;
    if (newExt) name = FSHelper.replaceExtension(name, newExt);

    return FSHelper.resolvePath(cacheDir, name);
  }
}
