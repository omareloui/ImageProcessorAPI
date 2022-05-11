import type { RequestHandler } from "express";
import { nanoid } from "nanoid";

import { APIError, FSHelper, ImageHelper } from "../lib";

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

  public static saveImage: RequestHandler = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) throw new APIError("You have to provide an image.", 400);

      const originalExt = FSHelper.getExtension(
        file.originalname
      ).toLowerCase();
      const newName = FSHelper.addExtension(nanoid(10), originalExt);
      const imagePath = FSHelper.joinPath(ImageHelper.IMAGES_DIR, newName);

      await FSHelper.createFile(imagePath, file.buffer);

      res.send({
        link: `/${ImageHelper.IMAGES_FOLDER_NAME}/${newName}`,
        filename: newName,
      });
    } catch (e) {
      next(e);
    }
  };
}
