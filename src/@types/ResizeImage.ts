import sharp from "sharp";

const sharpInstance = sharp();

export interface ResizeImageOptions {
  filename: string;
  filetype: Parameters<typeof sharpInstance.toFormat>[0];
  h?: number;
  w?: number;
}

export interface ResizeImageReturn {
  image: Buffer;
  filetype: string;
  isFromCache: boolean;
}
