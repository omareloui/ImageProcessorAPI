import { FSHelper } from "../../lib";

describe("FSHelper (file system helper)", () => {
  describe("joinPath", () => {
    it(`should join "/public" with "./image" to "public/image" or "public\\image" depending on the os`, () => {
      const path = FSHelper.joinPath("./public", "./images");
      expect(path).toEqual(`public${FSHelper.pathSeparator}images`);
    });
  });

  describe("resolvePath", () => {
    it(`should resolve "./public" and "./images" to "\${cwd()/public/images}" or "\${cwd()}\\public\\images" depending on the os`, () => {
      const path = FSHelper.resolvePath("./public", "./images");
      expect(path).toEqual(
        FSHelper.joinPath(process.cwd(), "public", "images")
      );
    });
  });

  describe("validateExistence", () => {
    it("should validate the current test file exists", async () => {
      const filePath = FSHelper.resolvePath(
        "./dist/__tests__/lib/fs-helper.spec.js"
      );
      const exists = await FSHelper.validateExistence(filePath);
      expect(exists).toBe(true);
    });

    it(`should not find a file with the name of "testing.js"`, async () => {
      const filePath = FSHelper.resolvePath(
        "./dist/__tests__/lib/testing-not-existence.js"
      );
      const exists = await FSHelper.validateExistence(filePath);
      expect(exists).toBe(false);
    });
  });

  describe("createFile", () => {
    afterEach(async () => {
      const filePath = FSHelper.joinPath(__dirname, "creation.test");
      await FSHelper.removeFile(filePath);
    });

    it(`should create a file named "creation.test" in the current directory (__dirname)`, async () => {
      const filePath = FSHelper.joinPath(__dirname, "creation.test");
      await FSHelper.createFile(filePath);
      const exists = await FSHelper.validateExistence(filePath);
      expect(exists).toBe(true);
    });

    it(`should create the file with the content "testing the creation of files"`, async () => {
      const filePath = FSHelper.joinPath(__dirname, "creation.test");
      await FSHelper.createFile(filePath, "testing the creation of files");
      const content = await FSHelper.readFile(filePath, { encoding: "utf-8" });
      expect(content).toBe("testing the creation of files");
    });
  });

  describe("removeFile", () => {
    it("should create a testing-deleting.js file and remove it", async () => {
      const filePath = FSHelper.joinPath(__dirname, "testing-deleting.js");
      await FSHelper.createFile(filePath);

      const existsBeforeDeleting = await FSHelper.validateExistence(filePath);
      expect(existsBeforeDeleting).toBe(true);

      await FSHelper.removeFile(filePath);

      const existsAfterDeleting = await FSHelper.validateExistence(filePath);
      expect(existsAfterDeleting).toBe(false);
    });
  });

  describe("readFile", () => {
    const filePath = FSHelper.joinPath(__dirname, "test-read.js");

    beforeAll(async () => {
      await FSHelper.createFile(filePath, "const test = 'testing'");
    });
    afterAll(async () => {
      await FSHelper.removeFile(filePath);
    });

    it(`should create a test-read.js file and read its content and match it's type to be a string`, async () => {
      const content = await FSHelper.readFile(filePath, { encoding: "utf-8" });
      expect(typeof content).toBe("string");
    });

    it(`should create a test-read.js file and read its content and match its actual content`, async () => {
      const content = await FSHelper.readFile(filePath, { encoding: "utf-8" });
      expect(content).toBe("const test = 'testing'");
    });
  });

  describe("ensureDir", () => {
    const dir = FSHelper.resolvePath("dist", "__tests__", "test-ensure-dir");

    afterAll(async () => {
      await FSHelper.removeDirRecursively(dir);
    });

    it("should create a non existing directory", async () => {
      const existsBefore = await FSHelper.validateExistence(dir);
      expect(existsBefore).toBe(false);

      await FSHelper.ensureDir(dir);

      const existsAfter = await FSHelper.validateExistence(dir);
      expect(existsAfter).toBe(true);
    });
  });

  describe("removeDirRecursively", () => {
    const dir = FSHelper.resolvePath(
      "dist",
      "__tests__",
      "test-remove-dir-recursively"
    );
    const file1Path = FSHelper.joinPath(dir, "test-ensureDir1.js");
    const file2Path = FSHelper.joinPath(dir, "test-ensureDir2.js");
    const files = [file1Path, file2Path];

    beforeAll(async () => {
      await FSHelper.ensureDir(dir);
      await Promise.all(files.map(x => FSHelper.createFile(x)));
    });

    it(`should remove the created "test-remove-dir-recursively" folder with its content`, async () => {
      await FSHelper.removeDirRecursively(dir);
      const filesExistence = await Promise.all(
        [...files, dir].map(x => FSHelper.validateExistence(x))
      );
      expect(filesExistence.every(_x => true)).toBe(true);
    });
  });

  describe("addExtension", () => {
    it('should add "png" extension to "filename" (filename.png)', () => {
      const filename = FSHelper.addExtension("filename", "png");
      expect(filename).toEqual("filename.png");
    });
  });

  describe("removeExtension", () => {
    it('should remove extension "png" from "filename.png" (filename)', () => {
      const filename = FSHelper.removeExtension("filename.png");
      expect(filename).toEqual("filename");
    });
  });

  describe("replaceExtension", () => {
    it('should replace "png" extension with "jpeg" extension', () => {
      const filename = FSHelper.replaceExtension("filename.png", "jpeg");
      expect(filename).toEqual("filename.jpeg");
    });
  });

  describe("getExtension", () => {
    it('should get the file extension of "filename.png" (png)', () => {
      const ext = FSHelper.getExtension("filename.png");
      expect(ext).toEqual("png");
    });
  });
});
