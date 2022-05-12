import supertest from "supertest";
import { app } from "../..";

const request = supertest(app);

describe("Views", () => {
  describe("/:image", () => {
    it("should go to 404 on visiting an image that doesn't exist", async () => {
      const res = await request.get("/any-image-that-doest-exist.png");
      expect(res.statusCode).toBe(404);
    });
  });
});
