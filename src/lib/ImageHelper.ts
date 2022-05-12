import sharp from "sharp";

import {
  ImagePlaceholderReturn,
  OperateImageOptions,
  OperateImageReturn,
} from "../@types";

import { FSHelper } from "./FSHelper";
import { ColorHelper } from "./ColorHelper";
import { ImageCache } from "./ImageCache";
import { ImageOperatorOptionsParser } from "./ImageOperatorOptionsParser";
import { ImageOperatorValidator } from "./ImageOperatorValidator";

interface CacheOptions {
  shouldCache?: boolean;
  cacheDir?: string;
}

// TODO: add max dimension
// TODO: validate the parsed data
// TODO: add more options to the placeholder

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
    const options = ImageOperatorOptionsParser.parsePlaceholderOptions(query);
    ImageOperatorValidator.validatePlaceholderOptions(options);

    const { width, height, color } = options;
    const filetype = this.PLACEHOLDER_DEFAULT_FILETYPE;

    const imageFromCache = await ImageCache.get(cacheDir, {
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
      await ImageCache.cache(
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
    const options = ImageOperatorOptionsParser.parseOperateOptions(query);
    ImageOperatorValidator.validateOperateOptions(options);

    const { filename, filetype } = options;

    const imageSrc = FSHelper.resolvePath(this.IMAGES_DIR, filename);
    await ImageOperatorValidator.validateImageExistence(imageSrc);

    const imageFromCache = await ImageCache.get(cacheDir, {
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
      await ImageCache.cache(
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
  // prettier-ignore
  private static createSharpInstance( imageSrc: string, { filetype, width, height, blur, flip, flop, grayscale, median, negate, rotate, }: OperateImageOptions) {
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
}
