import express from "express";
import orderRoutes from "./routes/orderRoutes";
import { errorHandler } from "./utils/errorHandler";

// Initialize the Express app
const app = express();

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Order picking route
app.use("/api", orderRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
