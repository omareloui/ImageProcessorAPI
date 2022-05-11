import { FSHelper, ImageHelper } from "../../lib";

describe("ImageHelper", () => {
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
      const imageBuffer1 = await createPlaceholder({ h: "300", w: "400" });
      const imageBuffer2 = await createPlaceholder({
        height: "300",
        width: "400",
      });

      expect(imageBuffer1.image).toBeTruthy();
      expect(imageBuffer2.image).toBeTruthy();
    });

    it("should cache the created image", async () => {
      const options = { h: 300, w: 400 };
      await createPlaceholder(options, { shouldCache: true });
      const createdImagePath = ImageHelper.getCachedImagePath(CACHE_MOCK_DIR, {
        ...options,
        filename: FSHelper.addExtension(
          ImageHelper.PLACEHOLDER_FILENAME,
          ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE
        ),
      });

      const exists = await FSHelper.validateExistence(createdImagePath);
      expect(exists).toBeTrue();
    });

    it("should create the image with the default extension", async () => {
      const options = { h: 135, w: 909 };
      await createPlaceholder(options, { shouldCache: true });
      const createdImagePath = ImageHelper.getCachedImagePath(CACHE_MOCK_DIR, {
        ...options,
        filename: FSHelper.addExtension(
          ImageHelper.PLACEHOLDER_FILENAME,
          ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE
        ),
      });

      expect(createdImagePath).toMatch(
        new RegExp(`\.${ImageHelper.PLACEHOLDER_DEFAULT_FILETYPE}$`)
      );

      const exists = await FSHelper.validateExistence(createdImagePath);
      expect(exists).toBeTrue();
    });

    it("should get image from cache if exists", async () => {
      const options = { h: 300, w: 400 };
      const { isFromCache } = await createPlaceholder(options, {
        shouldCache: true,
      });
      expect(isFromCache).toBeTrue();
    });
  });

  describe("resizeImage", () => {
    afterAll(async () => {
      await ImageHelper.removeCache(CACHE_MOCK_DIR);
    });

    type ResizeImageParams = Parameters<typeof ImageHelper.resize>;

    const resize = (
      options: ResizeImageParams[0],
      {
        cacheDir = CACHE_MOCK_DIR,
        shouldCache = false,
      }: ResizeImageParams[1] = {}
    ) => ImageHelper.resize(options, { cacheDir, shouldCache });

    it("should throw an error on not providing at least one dimension", async () => {
      let msg = "";
      try {
        await resize({ filename: "santamonica.jpg" });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("You have to provide a size.");
    });

    it("should throw an error on providing both dimensions with invalid numbers", async () => {
      let msg = "";
      try {
        await resize({ filename: "santamonica.jpg", width: "text" });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("You have to provide a size.");
    });

    it("should throw an error on not providing a filename", async () => {
      let msg = "";
      try {
        await resize({ width: "300" });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("You have to provide a filename.");
    });

    it("should throw an error if the requested file can't be found", async () => {
      let msg = "";
      try {
        await resize({ filename: "some_invalid_filename.jpg", width: "300" });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("Can't find the requested file.");
    });

    it("should work with on providing one of the two dimensions", async () => {
      const { image } = await resize({ filename: "santamonica.jpg", h: 200 });
      expect(image).toBeTruthy();
    });

    it("should throw an error on providing an invalid extension", async () => {
      let msg = "";
      try {
        await resize({
          filename: "santamonica.jpg",
          h: 200,
          extension: "invalid_ext",
        });
      } catch (e) {
        const err = e as Error;
        msg = err.message;
      }
      expect(msg).toMatch("You have to provide a valid file format.");
    });

    it("should make the file with the provided extension", async () => {
      {
        const extension = "png";
        const options = {
          filename: "santamonica.jpg",
          h: 200,
          extension,
        };
        const { filetype } = await resize(options, { shouldCache: true });

        expect(filetype).toBe(extension);

        const createdImagePath = ImageHelper.getCachedImagePath(
          CACHE_MOCK_DIR,
          {
            ...options,
            filename: FSHelper.replaceExtension(options.filename, extension),
          }
        );
        console.log(createdImagePath);

        const exists = await FSHelper.validateExistence(createdImagePath);
        expect(exists).toBeTrue();
      }

      {
        const extension = "tiff";
        const options = {
          filename: "icelandwaterfall.jpg",
          h: 200,
          extension,
        };
        const { filetype } = await resize(options, { shouldCache: true });

        expect(filetype).toBe(extension);

        const createdImagePath = ImageHelper.getCachedImagePath(
          CACHE_MOCK_DIR,
          {
            ...options,
            filename: FSHelper.replaceExtension(options.filename, extension),
          }
        );

        const exists = await FSHelper.validateExistence(createdImagePath);
        expect(exists).toBeTrue();
      }
    });

    it("should cache the resized image", async () => {
      const extension = "gif";
      const options = {
        filename: "icelandwaterfall.jpg",
        h: 500,
        extension,
      };
      const { isFromCache } = await resize(options, { shouldCache: true });
      expect(isFromCache).toBeFalse();

      const cacheImagePath = ImageHelper.getCachedImagePath(CACHE_MOCK_DIR, {
        ...options,
        newExt: extension,
      });
      const exists = await FSHelper.validateExistence(cacheImagePath);
      expect(exists).toBeTrue();
    });

    it("should get the created file from cache if created with different extension", async () => {
      const extension = "tiff";
      const options = {
        filename: "icelandwaterfall.jpg",
        h: 500,
        extension,
      };
      await resize(options, { shouldCache: true });
      const { isFromCache } = await resize(options, { shouldCache: true });
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