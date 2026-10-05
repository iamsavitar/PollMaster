import request from "supertest";
import app from "../src/app.js";

test("GET /health returns status", async () => {
  const response = await request(app).get("/health");
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe("ok");
});
