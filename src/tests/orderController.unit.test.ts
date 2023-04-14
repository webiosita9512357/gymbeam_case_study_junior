import { exportedForTesting } from "../controllers/orderController";
import { OrderItem, ProductPosition } from "../interfaces/products";

describe("OrderController", () => {
  const positions: ProductPosition[] = [
    {
      positionId: "position-1",
      x: 3,
      y: 1,
      z: 0,
      productId: "product-1",
      quantity: 10,
    },
    {
      positionId: "position-2",
      x: 87,
      y: 7,
      z: 100,
      productId: "product-1",
      quantity: 5,
    },
  ];

  describe("sortWarehouseQuantity", () => {
    it("should return sorted positions based on the order quantity", () => {
      const orderItem: OrderItem = {
        productId: "product-1",
        quantity: 7,
      };

      const result = exportedForTesting.sortWarehouseQuantity(
        positions,
        orderItem
      );

      expect(result).toEqual([
        {
          positionId: "position-2",
          x: 87,
          y: 7,
          z: 100,
          productId: "product-1",
          quantity: 5,
        },
        {
          positionId: "position-1",
          x: 3,
          y: 1,
          z: 0,
          productId: "product-1",
          quantity: 2,
        },
      ]);
    });
  });

  describe("sortWarehousePositions", () => {
    it("should return sorted positions based on the Euclidean distance", () => {
      const result = exportedForTesting.sortWarehousePositions(positions);

      expect(result).toEqual([
        {
          positionId: "position-1",
          x: 3,
          y: 1,
          z: 0,
          productId: "product-1",
          quantity: 10,
        },
        {
          positionId: "position-2",
          x: 87,
          y: 7,
          z: 100,
          productId: "product-1",
          quantity: 5,
        },
      ]);
    });
  });
});
