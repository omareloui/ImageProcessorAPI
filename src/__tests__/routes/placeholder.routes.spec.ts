import supertest from "supertest";
import { app } from "../..";
import { ImageHelper } from "../../lib";

const request = supertest(app);

describe("Placeholder endpoint", () => {
  describe("Endpoint existence", () => {
    it("should have /placeholder endpoint to create placeholder images", async () => {
      const res = await request.get("/placeholder?h=500&w=400");
      expect(res.status).toBe(200);
    });
  });

  describe("Validate inputs", () => {
    afterAll(async () => {
      await ImageHelper.removeCache();
    });

    it("should response with 400 status code on not providing sizes /placeholder", async () => {
      const res = await request.get("/placeholder");
      expect(res.status).toBe(400);
    });

    it("should response with 400 status code on not providing both dimensions for /placeholder", async () => {
      const res = await request.get("/placeholder?w=300");
      expect(res.status).toBe(400);
    });

    it("should response with 200 status code on providing both dimensions /placeholder", async () => {
      const res = await request.get("/placeholder?h=200&w=400");
      expect(res.status).toBe(200);
    });

    it("should response with 304 status code on requesting a cached image on /placeholder", async () => {
      const res = await request.get("/placeholder?h=200&w=400");
      expect(res.status).toBe(304);
    });

    it("should response with 400 status code on providing an invalid size /placeholder", async () => {
      const res = await request.get("/placeholder?w=200&h=this_is_height");
      expect(res.status).toBe(400);
    });
  });
});
