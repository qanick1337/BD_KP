import express from "express";
import cors from "cors";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import usersRoutes from "./routes/usersRoutes.js";
import dictRoutes from "./routes/dictRoutes.js";
import vacancyRoutes from "./routes/vacancyRoutes.js";
import candidatesRoutes from "./routes/candidateRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import statsRoutes from "./routes/statsRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tests", testRoutes);
app.use("/login", authRoutes);
app.use("/register", registerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/users", usersRoutes);
app.use("/dict", dictRoutes);
app.use("/vacancies", vacancyRoutes);
app.use("/candidates", candidatesRoutes);
app.use("/application", applicationRoutes);
app.use("/stats", statsRoutes);



app.listen(3000, () => {
  console.log("Port 3000, application started");
});

app.get("/", (req, res) => {
  res.send("Hello GET from homepage!");
});
