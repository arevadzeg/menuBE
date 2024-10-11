import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRouter from "./routes/uploadRoute";



const app = express();
const prisma = new PrismaClient();


app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes(prisma));
app.use("/store", storeRoutes(prisma));
app.use("/product", productRoutes(prisma));
app.use("/storage", uploadRouter())


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
