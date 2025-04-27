import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import hotelsRouter from "./api/hotel";
import connectDB from "./Infrastructure/db";
import bookingsRouter from "./api/booking";
import paymentsRouter from "./api/payment";
import { handleWebhook } from "./application/payment";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";
import { clerkMiddleware } from "@clerk/express";

const app = express();
const PORT = process.env.PORT || 8000;

// Stripe webhook handler should come BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Clerk authentication middleware
app.use(clerkMiddleware());

// Use express.json for the rest of the routes
app.use(express.json());

// CORS setup — make sure FRONTEND_URL is set in your .env file
app.use(
  cors({
    origin: "https://aidf-horizone-frontend-hafsa.netlify.app",
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// App routes
app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);

// Route not found handler (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(globalErrorHandlingMiddleware);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Start the server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

