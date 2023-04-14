import dotenv from "dotenv";
import app from "./app";

// Load environment variables from .env file
dotenv.config();

// setting PORT
const port = process.env.PORT || 3000;

// Start the Express app and listen for incoming requests
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
