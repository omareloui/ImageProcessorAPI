import type { RequestHandler } from "express";

import { FSHelper, ImageHelper } from "../lib";

export class ImagesController {
  public static getAll: RequestHandler = async (_req, res) => {
    const imagesLinks = await FSHelper.scanDirectory(ImageHelper.IMAGES_DIR, {
      onlyFiles: true,
    });
    const prefixedImages = imagesLinks.map(img => ({
      link: `/${ImageHelper.IMAGES_FOLDER_NAME}/${img}`,
      filename: img,
    }));
    res.send(prefixedImages);
  };
}
