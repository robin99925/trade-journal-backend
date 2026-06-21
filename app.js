const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

// app.use(cors());
const allowedOrigins = ["http://localhost:5173", "https://your-app.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
