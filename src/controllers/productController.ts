import { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import {  ref, deleteObject } from "firebase/storage";
import { storage } from "./uploadController";


const getImageNameFromUrl = (url: string): string => {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1]; 
  const name = lastPart.split('?')[0]; 
  return decodeURIComponent(name);
};

export const createProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { storeId } = req.params;
  const { title, price, image, isOnSale } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        title,
        price,
        image,
        isOnSale,
        storeId, // Ensure store exists and user is the owner
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};


export const deleteProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const imageRef = ref(storage, `${getImageNameFromUrl(product.image)}`); // Assuming product.image contains the file name

    if(product.image){

      await deleteObject(imageRef);
    }
    await prisma.product.delete({
      where: { id: productId },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product: ", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};


export const getStoreProducts = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { storeId } = req.params;

  // Get pagination parameters from query
  const page = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit = parseInt(req.query.limit as string) || 10; // Default to limit 10
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  // Get search query and sort options from the request query parameters
  const search = req.query.search as string; // Search query
  const sort = req.query.sort as string; // Sorting criteria
  const order = (req.query.order as string) || "asc"; // Sort direction: 'asc' or 'desc'

  // Define sorting options
  const orderBy: any = {};
  if (sort === "price") {
    orderBy.price = order; // Sort by price asc/desc
  } else if (sort === "name") {
    orderBy.title = order; // Sort by name (title) asc/desc
  }

  try {
    // Fetch products from the database with optional search and sorting
    const products = await prisma.product.findMany({
      where: {
        storeId,
        ...(search && {
          title: {
            contains: search, // Search in title using a "contains" filter
            mode: "insensitive", // Case-insensitive search
          },
        }),
      },
      skip, // Skip the calculated number of products
      take: limit, // Limit the number of products returned
      orderBy, // Apply sorting based on criteria
    });

    // Get the total count for pagination
    const totalCount = await prisma.product.count({
      where: {
        storeId,
        ...(search && {
          title: {
            contains: search, // Search in title for total count
            mode: "insensitive", // Case-insensitive search
          },
        }),
      },
    });

    // Send response with products, pagination, and total count
    res.status(200).json({
      totalCount,
      page,
      limit,
      products,
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { productId } = req.params;
  const { title, price, isOnSale, image } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { title, price, isOnSale, image },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};
