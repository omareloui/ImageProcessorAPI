export interface ImagePlaceholderOptions {
  height: number;
  width: number;
  color?: string;
}

export interface ImagePlaceholderReturn {
  image: Buffer;
  filetype: string;
  isFromCache: boolean;
}
