import { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";

export const createStore = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { name, userId } = req.body;
  try {
    const store = await prisma.store.create({
      data: {
        name,
        userId, // Make sure this comes from the authenticated user
      },
    });
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to create store" });
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
