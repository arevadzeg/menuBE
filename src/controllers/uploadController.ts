import { Request, Response } from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_CONFIG_API_KEY,
    authDomain: process.env.FIREBASE_CONFIG_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_CONFIG_PROJECT_ID,
    storageBucket: process.env.FIREBASE_CONFIG_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_CONFIG_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_CONFIG_APP_ID,
    measurementId: process.env.FIREBASE_CONFIG_MEASUREMENT_ID
  };


initializeApp(firebaseConfig);
const storage = getStorage();

export const uploadFile = async (req: Request, res: Response): Promise<void> => {

  try {
    if (!req.file) {
       res.status(400).send({ message: "No file provided" });
    }else{
        const storageRef = ref(storage, `files/${req.file.originalname}`);
        const metadata = {
          contentType: req.file.mimetype,
        };
    
        const snapshot = await uploadBytesResumable(
          storageRef,
          req.file.buffer,
          metadata
        );
    
        const downloadURL = await getDownloadURL(snapshot.ref);
    
        res.send({
          message: "File uploaded to Firebase storage",
          name: req.file.originalname,
          type: req.file.mimetype,
          downloadURL,
        });
    }

  } catch (error) {
    console.error("Error uploading file: ", error);
    res.status(400).send({ message: "Upload failed", error });
  }
};
