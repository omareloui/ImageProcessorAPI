import { FormatEnum } from "sharp";

import { ImagePlaceholderOptions, OperateImageOptions } from "../@types";

import { FSHelper } from "./FSHelper";

export class ImageOperatorOptionsParser {
  static parsePlaceholderOptions(query: any): Partial<ImagePlaceholderOptions> {
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

  static parseOperateOptions(query: any): Partial<OperateImageOptions> {
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

  // Utils //
  // prettier-ignore
  static parseValues<T extends keyof OperateImageOptions | keyof ImagePlaceholderOptions>(query: any, props: (T | string)[][]) {
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

  static parseNumberOrBoolean(value: string | undefined) {
    const bool = this.parseBoolean(value);
    if (bool !== undefined) return bool;

    const num = this.parseNumber(value);
    if (num !== undefined) return num;
    return false;
  }

  static parseBoolean(value: string | undefined) {
    if (value === undefined || value === null) return;
    if (value === "" || value.match(/^(true|yes|on)$/i)) return true;
    if (value.match(/^(false|no|off)$/i)) return false;
  }

  static parseNumber(value: string | undefined) {
    const parsedNum = parseInt(value || "");
    if (!isNaN(parsedNum)) return parsedNum;
  }

  static parseValueFromAliases(
    query: Record<string, string | undefined>,
    props: string | string[]
  ) {
    if (typeof props === "string") props = [props];
    for (const prop of props) {
      if (prop in query) return query[prop];
    }
    return null;
  }
}
