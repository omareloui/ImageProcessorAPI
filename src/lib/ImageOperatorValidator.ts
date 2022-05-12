import sharp from "sharp";

import { ImagePlaceholderOptions, OperateImageOptions } from "../@types";

import { FSHelper } from "./FSHelper";
import { ImageHelper } from "./ImageHelper";

export class ImageOperatorValidator {
  private static FORMATS = [...Object.keys(sharp.format), "jpg"];
  static MAX_DIMENSION = 10000;

  static validateOperateOptions(
    options: Partial<OperateImageOptions>
  ): asserts options is OperateImageOptions {
    const { filename, filetype, width, height } = options;

    if (!filename) throw new Error("You have to provide a filename.");
    const hasOperations = this.validateHasSomeOperation(options, [
      "width",
      "height",
      "flip",
      "flop",
      "blur",
      "grayscale",
      "median",
      "negate",
      "rotate",
    ]);

    const newExt = this.validateProvidedExtensionIsNew(
      filename,
      filetype as string
    );

    if (!hasOperations && !newExt)
      throw new Error("You have to provide at least one operation.");

    if (options.filetype && !this.FORMATS.includes(options.filetype as string))
      throw new Error(
        `You have to provide a valid file format (${this.FORMATS.join(", ")}).`
      );

    if (
      (width && width > this.MAX_DIMENSION) ||
      (height && height > this.MAX_DIMENSION)
    )
      throw new Error(
        `You can't exceed ${ImageOperatorValidator.MAX_DIMENSION}px for dimension.`
      );
  }

  static validatePlaceholderOptions(
    options: Partial<ImagePlaceholderOptions>
  ): asserts options is ImagePlaceholderOptions {
    const { width, height } = options;
    if (!width) throw new Error("You have to provide a width.");
    if (!height) throw new Error("You have to provide a height.");
  }

  static async validateImageExistenceByFilename(filename: string) {
    const imageSrc = FSHelper.resolvePath(ImageHelper.IMAGES_DIR, filename);
    const fileExists = await FSHelper.validateExistence(imageSrc);
    if (!fileExists) throw new Error("Can't find the requested file.");
  }

  static async validateImageExistence(path: string) {
    const fileExists = await FSHelper.validateExistence(path);
    if (!fileExists) throw new Error("Can't find the requested file.");
  }

  // Utils //
  private static validateHasSomeOperation<T extends Record<string, unknown>>(
    options: T,
    operations: Partial<keyof T>[]
  ) {
    const keys = Object.keys(options) as (keyof T)[];
    return operations.some(
      o => keys.includes(o) && options[o] !== null && options[o] !== undefined
    );
  }

  private static validateProvidedExtensionIsNew(
    filename: string,
    filetype: string
  ) {
    return FSHelper.getExtension(filename) !== filetype;
  }
}
