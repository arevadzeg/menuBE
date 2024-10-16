import { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";

export const createStore = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { name, userId, image, email, phone, facebook, instagram, address } = req.body;
  
  try {
    const store = await prisma.store.create({
      data: {
        name,
        userId, // Ensure this comes from the authenticated user
        image, // Optional field
        email, // Optional field
        phone, // Optional field
        facebook, // Optional field
        instagram, // Optional field
        address, // Optional field
      },
    });
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to create store" });
  }
};

export const getStoreByName = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { name } = req.params; // Get the name from the request parameters

  // TODO NEED TO BE UNIQUE
  try {
    const store = await prisma.store.findFirst({
      where: {
        name, // Use the unique store name to fetch the store
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json(store); // Return the store details if found
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch store" });
  }
};



export const getUserStores = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { userId } = req.params;
  try {
    const stores = await prisma.store.findMany({
      where: {
        userId, // Only fetch stores for the authenticated user
      },
    });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stores" });
  }
};
