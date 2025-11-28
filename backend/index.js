import express from "express";
import cors from "cors";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tests", testRoutes);
app.use("/login", authRoutes);
app.use("/register", registerRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(3000, () => {
  console.log("Port 3000, application started");
});

app.get("/", (req, res) => {
  res.send("Hello GET from homepage!");
});
