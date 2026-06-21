const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

app.use("/api/v1", routes);

module.exports = app;
