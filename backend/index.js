import express from "express";
import cors from "cors";
import testRoutes from "./routes/testRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tests", testRoutes);

app.listen(3000, () => {
  console.log("Port 3000, application started");
});

app.get("/", (req, res) => {
  res.send("Hello GET2 from homepage!");
});
