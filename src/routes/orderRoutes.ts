import { Router } from "express";
import { getOrderPicking } from "../controllers/orderController";

const router = Router();

router.post("/order-picking", getOrderPicking);

export default router;
