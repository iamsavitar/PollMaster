import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

app.get("/", (req, res) => res.json({ message: "PollMaster API is running" }));
app.get("/health", (req, res) => res.json({
  status: "ok",
  uptimeSeconds: Math.floor(process.uptime()),
  memory: process.memoryUsage().rss
}));

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;
