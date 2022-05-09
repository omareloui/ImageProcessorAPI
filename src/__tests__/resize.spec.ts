import supertest from "supertest";
import { app } from "..";

const request = supertest(app);

describe("Resize endpoint", () => {
  it("should have /resize endpoint to resize images", async () => {
    const res = await request.get("/resize?filename=test_filename&h=200&w=400");
    expect(res.status).toBe(200);
  });

  it("should response with 400 status code on not providing sizes nor filename for /resize", async () => {
    const res = await request.get("/resize");
    expect(res.status).toBe(400);
  });

  it("should response with 400 status code on not providing sizes for /resize", async () => {
    const res = await request.get("/resize?filename=test_name");
    expect(res.status).toBe(400);
  });

  it("should response with 400 status code on not providing filename for /resize", async () => {
    const res = await request.get("/resize?h=100&w=300");
    expect(res.status).toBe(400);
  });

  it("should response with 200 status code on providing a filename and at least one dimension on /resize", async () => {
    const res = await request.get("/resize?filename=test&h=400");
    expect(res.status).toBe(200);
  });
});
