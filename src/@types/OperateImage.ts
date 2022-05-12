import sharp from "sharp";

const sharpInstance = sharp();

export interface OperateImageOptions {
  filename: string;
  filetype: Parameters<typeof sharpInstance.toFormat>[0];

  height?: number;
  width?: number;
  rotate?: number;

  flip?: boolean;
  flop?: boolean;
  negate?: boolean;
  grayscale?: boolean;

  median?: boolean | number;
  blur?: boolean | number;
}

export interface OperateImageReturn {
  image: Buffer;
  filetype: string;
  isFromCache: boolean;
}
