import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController";

const router = Router();
const upload = multer(); 


const uploadRouter = () => {
    router.post("/upload", upload.single("filename"), uploadFile);
    return router;

}

export default uploadRouter;