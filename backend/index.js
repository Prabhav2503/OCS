import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import authrouter from "./routes/authroutes.js";
import datarouter from "./routes/dataroutes.js";
import middleware from "./middleware/authcontext.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",          
      "https://your-frontend.vercel.app/api/" 
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api", authrouter);
app.use("/api", middleware, datarouter);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
