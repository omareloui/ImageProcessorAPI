import supertest from "supertest";
import { app } from "../..";
import { ImageHelper } from "../../lib";

const request = supertest(app);

describe("Placeholder endpoint", () => {
  describe("Endpoint existence", () => {
    it("should have /api/placeholder endpoint to create placeholder images", async () => {
      const res = await request.get("/api/placeholder?h=500&w=400");
      expect(res.status).toBe(200);
    });
  });

  describe("Validate inputs", () => {
    afterAll(async () => {
      await ImageHelper.removeCache();
    });

    it("should response with 400 status code on not providing sizes /api/placeholder", async () => {
      const res = await request.get("/api/placeholder");
      expect(res.status).toBe(400);
    });

    it("should response with 400 status code on not providing both dimensions for /api/placeholder", async () => {
      const res = await request.get("/api/placeholder?w=300");
      expect(res.status).toBe(400);
    });

    it("should response with 200 status code on providing both dimensions /api/placeholder", async () => {
      const res = await request.get("/api/placeholder?h=200&w=400");
      expect(res.status).toBe(200);
    });

    it("should response with 400 status code on providing an invalid size /api/placeholder", async () => {
      const res = await request.get("/api/placeholder?w=200&h=this_is_height");
      expect(res.status).toBe(400);
    });
  });
});
