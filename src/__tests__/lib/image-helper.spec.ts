import {
  FSHelper,
  ImageHelper,
  ImageCache,
  ImageOperatorValidator,
} from "../../lib";

describe("ImageHelper", () => {
  async function getErrorMessage(cb: Function) {
    let msg;
    try {
      await cb();
    } catch (e) {
      const err = e as Error;
      msg = err.message;
    }
    return msg;
  }

  const CACHE_MOCK_DIR = FSHelper.joinPath(
    ImageHelper.IMAGES_DIR,
    "cache__mock"
  );

  describe("createPlaceholder", () => {
    afterAll(async () => {
      await ImageHelper.removeCache(CACHE_MOCK_DIR);
    });

    type CreatePlaceholderParams = Parameters<
      typeof ImageHelper.createPlaceholder
    >;

    const createPlaceholder = (
      options: CreatePlaceholderParams[0],
      {
        cacheDir = CACHE_MOCK_DIR,
        shouldCache = false,
      }: CreatePlaceholderParams[1] = {}
    ) => ImageHelper.createPlaceholder(options, { cacheDir, shouldCache });

    it("should throw an error on not providing both dimensions", async () => {
      {
        let msg = "";
        try {
          await createPlaceholder({});
        } catch (e) {
          const err = e as Error;
          msg = err.message;
        }
        expect(msg).toMatch("You have to provide a width.");
      }

      {
        let msg = "";
        try {
          await createPlaceholder({ height: "300" });
        } catch (e) {
          const err = e as Error;
          msg = err.message;
        }
        expect(msg).toMatch("You have to provide a width.");
      }

      {
        let msg = "";
        try {
          await createPlaceholder({ width: "300" });
        } catch (e) {
          const err = e as Error;
          msg = err.message;
        }
        expect(msg).toMatch("You have to provide a height.");
      }
    });

    it("should throw an error on providing invalid dimension", async () => {
      let msg = "";
      try {
        await createPlaceholder({ height: "300", width: "text" });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("You have to provide a width.");
    });

    it("should accept h or height and w or width as dimension queries", async () => {
      const imageBuffer1 = await createPlaceholder({
        height: "300",
        width: "400",
      });
      const imageBuffer2 = await createPlaceholder({
        height: "300",
        width: "400",
      });

      expect(imageBuffer1.image).toBeTruthy();
      expect(imageBuffer2.image).toBeTruthy();
    });

    it("should cache the created image", async () => {
      const options = { height: "300", width: "400" };
      await createPlaceholder(options, {
        shouldCache: true,
      });
      const createdImagePath = ImageCache.getPath(CACHE_MOCK_DIR, {
        height: +options.height,
        width: +options.width,
        filename: FSHelper.addExtension(
          ImageHelper.PLACEHOLDER_FILENAME,
          ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE
        ),
        filetype: ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE,
      });

      const exists = await FSHelper.validateExistence(createdImagePath);
      expect(exists).toBeTrue();
    });

    it("should create the image with the default extension", async () => {
      const options = { height: "135", width: "909" };
      await createPlaceholder(options, { shouldCache: true });
      const createdImagePath = ImageCache.getPath(CACHE_MOCK_DIR, {
        height: +options.height,
        width: +options.width,
        filename: FSHelper.addExtension(
          ImageHelper.PLACEHOLDER_FILENAME,
          ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE
        ),
        filetype: ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE,
      });

      expect(createdImagePath).toMatch(
        new RegExp(`\.${ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE}$`)
      );

      const exists = await FSHelper.validateExistence(createdImagePath);
      expect(exists).toBeTrue();
    });

    it("should get image from cache if exists", async () => {
      const options = { height: "300", width: "400" };
      const { isFromCache } = await createPlaceholder(options, {
        shouldCache: true,
      });
      expect(isFromCache).toBeTrue();
    });
  });

  describe("operate", () => {
    afterAll(async () => {
      await ImageHelper.removeCache(CACHE_MOCK_DIR);
    });

    type OperateImageParams = Parameters<typeof ImageHelper.operate>;

    const operate = (
      options: OperateImageParams[0],
      {
        cacheDir = CACHE_MOCK_DIR,
        shouldCache = false,
      }: OperateImageParams[1] = {}
    ) => ImageHelper.operate(options, { cacheDir, shouldCache });

    it("should throw an error on not providing a filename", async () => {
      const msg = await getErrorMessage(() => operate({}));
      expect(msg).toMatch("You have to provide a filename.");
    });

    it("should throw an error on not providing any operation", async () => {
      const msg = await getErrorMessage(() =>
        operate({ filename: "santamonica.jpg" })
      );
      expect(msg).toMatch("You have to provide at least one operation.");
    });

    it("should throw an error on if the only provided operation is the default", async () => {
      const msg = await getErrorMessage(() =>
        operate({
          filename: "santamonica.jpg",
          flip: "false",
        })
      );
      expect(msg).toMatch("You have to provide at least one operation.");
    });

    it("should throw an error on providing an invalid extension", async () => {
      const msg = await getErrorMessage(() =>
        operate({ filename: "santamonica.jpg", filetype: "invalid_ext" })
      );
      expect(msg).toMatch("You have to provide a valid file format");
    });

    it("should throw an error on providing a large width or height value", async () => {
      const msg = await getErrorMessage(() =>
        operate({
          filename: "santamonica.jpg",
          width: `${ImageOperatorValidator.MAX_DIMENSION + 1}`,
        })
      );
      expect(msg).toMatch(
        `You can't exceed ${ImageOperatorValidator.MAX_DIMENSION}px for dimension.`
      );
    });

    it("should throw an error if the requested file can't be found", async () => {
      const msg = await getErrorMessage(() =>
        operate({ filename: "some_invalid_filename.jpg", width: "300" })
      );
      expect(msg).toMatch("Can't find the requested file.");
    });

    it("should work with on providing one of the two dimensions", async () => {
      const { image } = await operate({
        filename: "santamonica.jpg",
        height: "200",
      });
      expect(image).toBeTruthy();
    });

    it("should work on providing only a flip value", async () => {
      const { image } = await operate({
        filename: "santamonica.jpg",
        flip: "true",
      });
      expect(image).toBeTruthy();
    });

    it("should make the file with the provided extension", async () => {
      {
        const extension = "png";
        const options = {
          filename: "santamonica.jpg",
          height: "200",
          extension,
        };
        const { filetype } = await operate(options, { shouldCache: true });

        expect(filetype).toBe(extension);

        const createdImagePath = ImageCache.getPath(CACHE_MOCK_DIR, {
          ...options,
          height: +options.height,
          filename: FSHelper.replaceExtension(options.filename, extension),
          filetype: extension,
        });

        const exists = await FSHelper.validateExistence(createdImagePath);
        expect(exists).toBeTrue();
      }

      {
        const extension = "tiff";
        const options = {
          filename: "icelandwaterfall.jpg",
          height: "200",
          extension,
        };
        const { filetype } = await operate(options, { shouldCache: true });

        expect(filetype).toBe(extension);

        const createdImagePath = ImageCache.getPath(CACHE_MOCK_DIR, {
          ...options,
          height: +options.height,
          filename: FSHelper.replaceExtension(options.filename, extension),
          filetype: extension,
        });

        const exists = await FSHelper.validateExistence(createdImagePath);
        expect(exists).toBeTrue();
      }
    });

    it("should cache the resized image", async () => {
      const extension = "gif";
      const options = {
        filename: "icelandwaterfall.jpg",
        height: "500",
        extension,
      };
      const { isFromCache } = await operate(options, { shouldCache: true });
      expect(isFromCache).toBeFalse();

      const cacheImagePath = ImageCache.getPath(CACHE_MOCK_DIR, {
        ...options,
        height: +options.height,
        filetype: extension,
      });
      const exists = await FSHelper.validateExistence(cacheImagePath);
      expect(exists).toBeTrue();
    });

    it("should get the created file from cache if created with different extension", async () => {
      const extension = "tiff";
      const options = {
        filename: "icelandwaterfall.jpg",
        height: "500",
        extension,
      };
      await operate(options, { shouldCache: true });
      const { isFromCache } = await operate(options, { shouldCache: true });
      expect(isFromCache).toBeTrue();
    });
  });

  describe("removeCache", () => {
    beforeAll(async () => {
      await FSHelper.ensureDir(CACHE_MOCK_DIR);
    });

    it("should remove the cache folder", async () => {
      await ImageHelper.removeCache(CACHE_MOCK_DIR);
      const exists = await FSHelper.validateExistence(CACHE_MOCK_DIR);
      expect(exists).toBe(false);
    });
  });
});
