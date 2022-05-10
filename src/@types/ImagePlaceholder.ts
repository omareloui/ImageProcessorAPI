export interface ImagePlaceholderOptions {
  h: number;
  w: number;
  color?: string;
}

export interface ImagePlaceholderReturn {
  image: Buffer;
  filetype: string;
  isFromCache: boolean;
}
