import sharp, { FormatEnum } from "sharp";

import {
  ImagePlaceholderOptions,
  ImagePlaceholderReturn,
  OperateImageOptions,
  OperateImageReturn,
} from "../@types";
import { FSHelper } from "./FSHelper";
import { ColorHelper } from "./ColorHelper";

interface CacheImagePathOptions {
  filename: string;
  newExt?: string;
  width?: number;
  height?: number;
}

interface CacheOptions {
  shouldCache?: boolean;
  cacheDir?: string;
}

// TODO: add max dimension

export class ImageHelper {
  static IMAGES_FOLDER_NAME = "images";
  static IMAGES_DIR = FSHelper.joinPath("./public", this.IMAGES_FOLDER_NAME);
  static CACHE_DIR = FSHelper.joinPath(this.IMAGES_DIR, "cache");

  static PLACEHOLDER_FILENAME = "placeholder";
  static PLACEHOLDER_DEFAULT_FILETYPE = "webp" as const;

  static async createPlaceholder(
    query: any,
    { shouldCache = true, cacheDir = this.CACHE_DIR }: CacheOptions = {}
  ): Promise<ImagePlaceholderReturn> {
    const options = this.parseCreatePlaceholderOptions(query);
    this.validateCreatePlaceholderOptions(options);

    const { width, height, color } = options;
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
        height,
        width,
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

  static async operate(
    query: any,
    { shouldCache = true, cacheDir = this.CACHE_DIR }: CacheOptions = {}
  ): Promise<OperateImageReturn> {
    const options = this.parseOperateOptions(query);
    this.validateOperateOptions(options);

    const { filename, width, height, filetype } = options;

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
      .resize(width, height)
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
    const options = {
      color: query.color || query.clr,
    } as Partial<ImagePlaceholderOptions>;

    const w = this.parseValueFromAliases(query, ["width", "w"]);
    if (w !== null) options.width = this.parseNumber(w);

    const height = this.parseValueFromAliases(query, ["height", "h"]);
    if (height !== null) options.height = this.parseNumber(height);

    return options;
  }

  private static parseOperateOptions(query: any): Partial<OperateImageOptions> {
    const options = {} as Partial<OperateImageOptions>;

    const filename = this.parseValueFromAliases(query, [
      "filename",
      "file",
      "image",
    ]);
    if (filename !== null) options.filename = filename;

    options.filetype =
      (this.parseValueFromAliases(query, [
        "ext",
        "extension",
        "filetype",
        "format",
      ]) as keyof FormatEnum) ||
      FSHelper.getExtension(options.filename || "") ||
      "webp";

    const w = this.parseValueFromAliases(query, ["width", "w"]);
    if (w !== null) options.width = this.parseNumber(w);

    const h = this.parseValueFromAliases(query, ["height", "h"]);
    if (h !== null) options.height = this.parseNumber(h);

    const r = this.parseValueFromAliases(query, ["rotate", "r"]);
    if (r !== null) options.rotate = this.parseNumber(r);

    const flip = this.parseValueFromAliases(query, ["flip", "fy"]);
    if (flip !== null) options.flip = this.parseBoolean(flip);

    const flop = this.parseValueFromAliases(query, ["flop", "fx"]);
    if (flop !== null) options.flop = this.parseBoolean(flop);

    const median = this.parseValueFromAliases(query, ["median", "m"]);
    if (median !== null) options.median = this.parseNumberOrBoolean(median);

    const blur = this.parseValueFromAliases(query, ["blur", "b"]);
    if (blur !== null) options.blur = this.parseNumberOrBoolean(blur);

    const negate = this.parseValueFromAliases(query, ["negate", "n"]);
    if (negate !== null) options.negate = this.parseBoolean(negate);

    const grayscale = this.parseValueFromAliases(query, [
      "grayscale",
      "greyscale",
      "g",
    ]);
    if (grayscale !== null) options.grayscale = this.parseBoolean(grayscale);

    return options;
  }

  private static parseNumberOrBoolean(value: string | undefined) {
    const bool = this.parseBoolean(value);
    if (bool !== undefined) return bool;

    const num = this.parseNumber(value);
    if (num !== undefined) return num;
    return false;
  }

  private static parseBoolean(value: string | undefined) {
    if (value === undefined || value.match(/^(true|yes|on)$/i)) return true;
    if (value.match(/^(false|no|off)$/i)) return false;
  }

  private static parseNumber(value: string | undefined) {
    const parsedNum = parseInt(value || "");
    if (!isNaN(parsedNum)) return parsedNum;
  }

  private static parseValueFromAliases(
    query: Record<string, string | undefined>,
    props: string | string[]
  ) {
    if (typeof props === "string") props = [props];
    for (const prop of props) {
      if (prop in query) return query[prop];
    }
    return null;
  }

  // --- Validate --- //
  private static validateCreatePlaceholderOptions(
    options: Partial<ImagePlaceholderOptions>
  ): asserts options is ImagePlaceholderOptions {
    const { width, height } = options;
    if (!width) throw new Error("You have to provide a width.");
    if (!height) throw new Error("You have to provide a height.");
  }

  private static validateOperateOptions(
    options: Partial<OperateImageOptions>
  ): asserts options is OperateImageOptions {
    const { filename, width, height } = options;
    if (!filename) throw new Error("You have to provide a filename.");
    if (!width && !height) throw new Error("You have to provide a size.");
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
    { width, height, filename, newExt }: CacheImagePathOptions
  ) {
    const oldExt = FSHelper.getExtension(filename);
    let name = `${FSHelper.removeExtension(filename)}_`;

    if (width) name += width;
    if (height) name += `x${height}`;

    name = FSHelper.replaceExtension(name, newExt || oldExt);

    return FSHelper.resolvePath(cacheDir, name);
  }
}
