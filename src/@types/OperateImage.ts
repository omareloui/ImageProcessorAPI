import sharp from "sharp";

const sharpInstance = sharp();

export interface OperateImageOptions {
  filename: string;
  filetype: Parameters<typeof sharpInstance.toFormat>[0];
  h?: number;
  w?: number;
}

export interface OperateImageReturn {
  image: Buffer;
  filetype: string;
  isFromCache: boolean;
}
