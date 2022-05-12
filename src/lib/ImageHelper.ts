import sharp, { FormatEnum } from "sharp";

import {
  ImagePlaceholderOptions,
  ImagePlaceholderReturn,
  OperateImageOptions,
  OperateImageReturn,
} from "../@types";
import { FSHelper } from "./FSHelper";
import { ColorHelper } from "./ColorHelper";

interface CacheOptions {
  shouldCache?: boolean;
  cacheDir?: string;
}

// TODO: add max dimension
// TODO: validate the parsed data
// TODO: add more options to the placeholder
// TODO: refactor the file

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
      filetype,
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
          filetype,
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

    const { filename, filetype } = options;

    const imageSrc = FSHelper.resolvePath(this.IMAGES_DIR, filename);
    await this.validateImageExistence(imageSrc);

    const imageFromCache = await this.getFromCache(cacheDir, {
      ...options,
      filename,
    });
    if (imageFromCache)
      return {
        image: imageFromCache,
        isFromCache: true,
        filetype: filetype as string,
      };

    const newImageBuffer = await this.createSharpInstance(
      imageSrc,
      options
    ).toBuffer();

    if (shouldCache)
      await this.cacheImage(
        cacheDir,
        {
          ...options,
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
  // --- Sharp --- //
  private static createSharpInstance(
    imageSrc: string,
    {
      filetype,
      width,
      height,
      blur,
      flip,
      flop,
      grayscale,
      median,
      negate,
      rotate,
    }: OperateImageOptions
  ) {
    const s = sharp(imageSrc).toFormat(filetype);

    if (width || height) s.resize(width, height);

    if (rotate) s.rotate(rotate);

    if (flip) s.flip();
    if (flop) s.flop();
    if (negate) s.negate();
    if (grayscale) s.grayscale();

    if (grayscale) s.grayscale();

    if (blur) s.blur(typeof blur === "number" ? blur : undefined);
    if (median) s.median(typeof median === "number" ? median : undefined);

    return s;
  }

  // --- Parse --- //
  private static parseCreatePlaceholderOptions(
    query: any
  ): Partial<ImagePlaceholderOptions> {
    const options = {
      color: query.color || query.clr,
    } as Partial<ImagePlaceholderOptions>;

    const values = this.parseValues(query, [
      ["width", "w"],
      ["height", "h"],
    ]);

    (["width", "height"] as const).forEach(x => {
      if (x in values) options[x] = this.parseNumber(values[x]);
    });

    return options;
  }

  private static parseOperateOptions(query: any): Partial<OperateImageOptions> {
    const options = {} as Partial<OperateImageOptions>;

    const values = this.parseValues(query, [
      ["filename", "file", "image"],
      ["filetype", "ext", "extension", "format"],
      ["width", "w"],
      ["height", "h"],
      ["rotate", "r"],
      ["flip", "fx"],
      ["flop", "fy"],
      ["median", "m"],
      ["blur", "b"],
      ["negate", "n"],
      ["grayscale", "greyscale", "g"],
    ]);

    if (values.filename !== null) options.filename = values.filename;

    options.filetype =
      (values.filetype as keyof FormatEnum) ||
      FSHelper.getExtension(options.filename || "") ||
      "webp";

    (["width", "height", "rotate"] as const).forEach(x => {
      if (x in values) options[x] = this.parseNumber(values[x]);
    });

    (["flip", "flop", "negate", "grayscale"] as const).forEach(x => {
      if (x in values) options[x] = this.parseBoolean(values[x]);
    });

    (["median", "blur"] as const).forEach(x => {
      if (x in values) options[x] = this.parseNumberOrBoolean(values[x]);
    });

    return options;
  }

  // Parse Utils //
  private static parseValues<
    T extends keyof OperateImageOptions | keyof ImagePlaceholderOptions
  >(query: any, props: (T | string)[][]) {
    const values = props.reduce((acc, curr) => {
      const value = this.parseValueFromAliases(
        query,
        curr as unknown as string[]
      );
      if (value !== null) acc[curr[0] as T] = value;
      return acc;
    }, {} as Record<T, string | undefined>);
    return values;
  }

  private static parseNumberOrBoolean(value: string | undefined) {
    const bool = this.parseBoolean(value);
    if (bool !== undefined) return bool;

    const num = this.parseNumber(value);
    if (num !== undefined) return num;
    return false;
  }

  private static parseBoolean(value: string | undefined) {
    if (value === undefined || value === null) return;
    if (value === "" || value.match(/^(true|yes|on)$/i)) return true;
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
    options: OperateImageOptions | ImagePlaceholderOptions,
    image: Buffer
  ) {
    const dist = this.getCachedImagePath(cacheDir, options);
    await FSHelper.ensureDir(cacheDir);
    await FSHelper.createFile(dist, image);
  }

  private static async getFromCache(
    cacheDir: string,
    options: OperateImageOptions | ImagePlaceholderOptions
  ): Promise<Buffer | false> {
    const src = this.getCachedImagePath(cacheDir, options);
    const exists = await FSHelper.validateExistence(src);
    if (exists) return (await FSHelper.readFile(src)) as Buffer;
    return false;
  }

  static getCachedImagePath(
    cacheDir: string,
    options: OperateImageOptions | ImagePlaceholderOptions
  ) {
    const name = this.generateCacheImageFilename(options);
    return FSHelper.resolvePath(cacheDir, name);
  }

  private static generateCacheImageFilename<
    T extends OperateImageOptions & ImagePlaceholderOptions
  >({
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
