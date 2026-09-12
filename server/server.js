//List of all the middleware and routes used in the application
require("dotenv").config();
const express = require("express");
const logger = require("./middleware/logger");
const corsHandler = require("./middleware/corsHandler");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`FATAL: missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
connectDB();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.use(logger);
}
app.use(corsHandler);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Capstone Task API",
    version: "1.0.0",
    health: "/api/health",
    endpoints: ["/api/auth", "/api/tasks"]
  });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        time: new Date()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
