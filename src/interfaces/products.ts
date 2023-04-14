// Product infromation with position in warehouse
export interface ProductPosition {
  positionId: string;
  x: number;
  y: number;
  z: number;
  productId: string;
  quantity: number;
}

// Order item as received from the client
export interface OrderItem {
  productId: string;
  quantity: number;
}
