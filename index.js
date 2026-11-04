import express from "express";
import dotenv from "dotenv";
import authRouter from "./src/auth/authroute.js"; 
import clientRouter from "./src/User/Client/transfert/src/TransfertRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/client", clientRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    error: message,
    status 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
