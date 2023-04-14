import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { ProductPosition, OrderItem } from "../interfaces/products";

// getOrderPicking function to handle the order picking process
export const getOrderPicking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the order from the request body
    const order: OrderItem[] = req.body;

    // Check if the order is an array
    if (!Array.isArray(order)) {
      const error = new Error("Order should be an array");
      error.name = "BAD_REQUEST";
      throw error;
    }

    // Check if the order is empty
    if (order.length === 0) {
      const error = new Error("The order is empty.");
      error.name = "BAD_REQUEST";
      throw error;
    }

    //check if product id is valid and quantity is valid
    for (const item of order) {
      if (
        !item.quantity ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        !item.productId ||
        typeof item.productId !== "string" ||
        item.productId.length === 0
      ) {
        const error = new Error("One or more products are invalid.");
        error.name = "BAD_REQUEST";
        throw error;
      }
    }

    // Initialize the result array
    const result: ProductPosition[] = [];

    // Iterate through each item in the order
    for (const item of order) {
      // Check if the product id or quantity are valid
      if (
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.productId !== "string" ||
        item.productId.length === 0
      ) {
        const error = new Error("One or more of the products are invalid.");
        error.name = "BAD_REQUEST";
        throw error;
      }

      // Fetch the warehouse positions for the current product
      const response = await axios.get<ProductPosition[]>(
        `https://dev.aux.boxpi.com/case-study/products/${item.productId}/positions`,
        {
          headers: { "x-api-key": process.env.API_KEY },
        }
      );

      // Check if the external API call was successful
      if (response.status !== 200) {
        if (response.status === 404) {
          const error = new Error(
            `Product with id ${item.productId} was not found.`
          );
          error.name = "NOT_FOUND";
          throw error;
        } else {
          const error = new Error(
            `API call to get positions for product ${item.productId} failed.`
          );
          error.name = "EXTERNAL_API_ERROR";
          throw error;
        }
      }

      // Initialize the result array
      result.push(...sortWarehouseQuantity(response.data, item));
    }

    //sort for shortest path and return the wanted input
    const sortedResult = sortWarehousePositions(result).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      positionId: item.positionId,
    }));

    // Send the result as a JSON response
    res.json(sortedResult);
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};

// sort by quantity
const sortWarehouseQuantity = (
  positions: ProductPosition[],
  item: OrderItem
) => {
  //results array
  const result: ProductPosition[] = [];

  // Sort the positions by quantity
  positions.sort((a, b) => a.quantity - b.quantity);

  // Initialize remainingQuantity with the ordered quantity
  let remainingQuantity = item.quantity;

  // Iterate through the sorted positions
  for (const position of positions) {
    // Calculate the quantity to pick from the current position
    const pickedQuantity = Math.min(position.quantity, remainingQuantity);

    // Add the picked quantity and position to the result
    result.push({
      ...position,
      quantity: pickedQuantity,
    });

    // Update the remainingQuantity
    remainingQuantity -= pickedQuantity;

    // If there's no remaining quantity, move on to the next product
    if (remainingQuantity === 0) {
      break;
    }

    // If there's still remaining quantity, but there are no more positions, throw an error
    if (remainingQuantity > 0 && position === positions.slice(-1)[0]) {
      const error = new Error(
        `Not enough quantity of product ${item.productId} in the warehouse.`
      );
      error.name = "BAD_REQUEST";
      throw error;
    }
  }

  return result;
};

// calculate the Euclidean distance between the origin (0,0,0) and the position of the product
// (positions already sorted by quantity)
const sortWarehousePositions = (
  positions: ProductPosition[]
): ProductPosition[] => {
  return positions.sort((a, b) => {
    const distanceA = Math.sqrt(
      Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2)
    );
    const distanceB = Math.sqrt(
      Math.pow(b.x, 2) + Math.pow(b.y, 2) + Math.pow(b.z, 2)
    );
    return distanceA - distanceB;
  });
};

// testing exports  for the functions
export const exportedForTesting = {
  sortWarehouseQuantity,
  sortWarehousePositions,
};
