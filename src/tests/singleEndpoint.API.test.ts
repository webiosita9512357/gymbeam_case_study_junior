import request from "supertest";
import app from "../app";
import nock from "nock";
import mocks from "./mocks.json";

describe("POST /api/order-picking", () => {
  beforeEach(() => {
    nock("https://dev.aux.boxpi.com")
      .get("/case-study/products/product-1/positions")
      .reply(200, mocks.positions);
    nock("https://dev.aux.boxpi.com")
      .get("/case-study/products/product-2/positions")
      .reply(200, mocks.positions2);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should return product positions for picking", async () => {
    const order = [
      { productId: "product-1", quantity: 5 },
      { productId: "product-2", quantity: 1 },
    ];

    const response = await request(app).post("/api/order-picking").send(order);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("productId");
    expect(response.body[0]).toHaveProperty("positionId");
    expect(response.body[0]).toHaveProperty("quantity");
  });

  it("should return an empty array if the order is empty", async () => {
    const response = await request(app).post("/api/order-picking").send([]);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "The order is empty.");
  });

  it("should return a 400 error if the product ID is invalid", async () => {
    const order = [{ productId: true, quantity: "3" }];

    const response = await request(app).post("/api/order-picking").send(order);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should return a 400 error if the order is not an array", async () => {
    const order = { productId: "product-1", quantity: 3 };

    const response = await request(app).post("/api/order-picking").send(order);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Order should be an array");
  });

  it("should return a 400 error if the order item doesn't have a productId or quantity", async () => {
    const order = [{ productId: "product-1" }, { quantity: 5 }];

    const response = await request(app).post("/api/order-picking").send(order);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "One or more products are invalid."
    );
  });
});
