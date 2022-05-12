import sharp from "sharp";

import { ImagePlaceholderOptions, OperateImageOptions } from "../@types";

import { FSHelper } from "./FSHelper";

export class ImageOperatorValidator {
  static validatePlaceholderOptions(
    options: Partial<ImagePlaceholderOptions>
  ): asserts options is ImagePlaceholderOptions {
    const { width, height } = options;
    if (!width) throw new Error("You have to provide a width.");
    if (!height) throw new Error("You have to provide a height.");
  }

  static validateOperateOptions(
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

  static async validateImageExistence(path: string) {
    const fileExists = await FSHelper.validateExistence(path);
    if (!fileExists) throw new Error("Can't find the requested file.");
  }
}
