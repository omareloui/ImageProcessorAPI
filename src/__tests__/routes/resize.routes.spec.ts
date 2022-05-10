import supertest from "supertest";
import { app } from "../..";
import { FSHelper } from "../../lib";

const request = supertest(app);

describe("Resize endpoint", () => {
  describe("Endpoint existence", () => {
    it("should have /resize endpoint to resize images", async () => {
      const res = await request.get("/resize?filename=fjord.jpg&h=200&w=400");
      expect(res.status).toBe(200);
    });
  });

  describe("Validate inputs", () => {
    it("should response with 400 status code on not providing sizes nor filename for /resize", async () => {
      const res = await request.get("/resize");
      expect(res.status).toBe(400);
    });

    it("should response with 400 status code on not providing sizes for /resize", async () => {
      const res = await request.get("/resize?filename=fjord.jpg");
      expect(res.status).toBe(400);
    });

    it("should response with 400 status code on not providing filename for /resize", async () => {
      const res = await request.get("/resize?h=100&w=300");
      expect(res.status).toBe(400);
    });

    it("should response with 200 status code on providing a filename and at least one dimension on /resize", async () => {
      const res = await request.get("/resize?filename=fjord.jpg&h=400");
      expect(res.status).toBe(200);
    });

    it("should response with 304 status code on requesting a cached image on /resize", async () => {
      const res = await request.get("/resize?filename=fjord.jpg&h=400");
      expect(res.status).toBe(304);
    });

    it("should response with 400 status code on providing a filename and one invalid dimension on /resize", async () => {
      const res = await request.get(
        "/resize?filename=fjord.jpg&h=this_is_height_string"
      );
      expect(res.status).toBe(400);
    });

    it("should response with 400 status code on providing a filename that doesn't exist on /resize", async () => {
      const res = await request.get("/resize?filename=test.jpg&h=400");
      expect(res.status).toBe(400);
    });
  });

  describe("Functionality", () => {
    it("should delete all cache on visiting /resize/cache with DELETE method", async () => {
      await request.delete("/resize/cache");
      const exists = await FSHelper.validateExistence("./images/thumbs");
      expect(exists).toEqual(false);
    });
  });
});
