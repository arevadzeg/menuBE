import express, { Router } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import multer from "multer";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWjzvwvNTHpZqqlQnFSYTX-XuV0yC49Vg",
  authDomain: "menu-28d11.firebaseapp.com",
  projectId: "menu-28d11",
  storageBucket: "menu-28d11.appspot.com",
  messagingSenderId: "638610261342",
  appId: "1:638610261342:web:41142d4f7fc1c14a63fbcf",
  measurementId: "G-0LY2PJ8NSR",
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(FirebaseApp);
// import dotenv from 'dotenv';

// dotenv.config();

const app = express();
const prisma = new PrismaClient();

const storage = getStorage();
const upload = multer();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes(prisma));
app.use("/store", storeRoutes(prisma));
app.use("/product", productRoutes(prisma));

const route: Router = express.Router();

route.post("/upload", upload.single("filename"), async (req, res) => {
  try {
    const storageRed = ref(storage, `files${req.file?.originalname} YLE`);

    const metadata = {
      contendType: req.file?.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRed,
      req.file?.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    return res.send({
      message: "file uploaded to firebase storage",
      name: req.file?.originalname,
      type: req.file?.mimetype,
      downloadURL: downloadURL,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
