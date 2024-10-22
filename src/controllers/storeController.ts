import { Request, Response } from "express";
import { Prisma, type PrismaClient } from "@prisma/client";

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

  try {
    const store = await prisma.store.findFirst({
      where: {
        name: {
          // Using a case-insensitive search
          contains: name,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json(store); // Return the store details if found
  } catch (error) {
    console.error("Error fetching store:", error); // Log error details for debugging
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


export const createCategory = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {

  console.log('aq movidqa')
  const { storeId } = req.params; // Get the name from the request parameters


  const { categoryName} = req.body

  console.log('categoryName', categoryName,storeId)

  try {
    // Ensure the category name is unique per store
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: storeId,
        name: categoryName,
      },
    });

    if (existingCategory) {
      throw new Error(`Category '${categoryName}' already exists for this store.`);
    }

    // Create the new category
    const newCategory = await prisma.category.create({
      data: {
        storeId: storeId,
        name: categoryName,
      },
    });


    return res.status(200).json(newCategory); // Return the store details if found

  } catch (error) {
    console.error('Error creating category:', 'error.message');
    throw error;
  } 

};


export const createSubCategory = async (req: Request, res: Response, prisma: PrismaClient) => {
  const { categoryId } = req.params; // Extract categoryId from the request parameters
  const { subCategoryName } = req.body; // Extract subCategoryName from request body

  try {
    // Ensure the subcategory name is unique per category
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: categoryId,
        name: subCategoryName,
      },
    });

    if (existingSubCategory) {
      return res.status(400).json({ message: `Subcategory '${subCategoryName}' already exists for this category.` });
    }

    // Create the new subcategory
    const newSubCategory = await prisma.subCategory.create({
      data: {
        categoryId: categoryId,
        name: subCategoryName,
      },
    });

    return res.status(200).json(newSubCategory);

  } catch (error) {
    // console.error('Error creating subcategory:', error.message);
    return res.status(500).json({ message: 'An error occurred while creating subcategory.' });
  }
};


export const getCategoriesWithSubCategories = async (req: Request, res: Response, prisma: PrismaClient) => {
  const { storeId } = req.params; // Extract storeId from request parameters

  try {
    const categories = await prisma.category.findMany({
      where: { storeId: storeId },
      include: {
        subCategories: true, // Include all associated subcategories
      },
    });
    console.log('dddddddddddddddd123',categories)

    return res.status(200).json(categories);

  } catch (error) {
    // console.error('Error fetching categories:', error.message);
    return res.status(500).json({ message: 'An error occurred while fetching categories.' ,error});
  }
};




export const updateCategory = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { categoryId } = req.params; // Extract categoryId from the request parameters
  const { categoryName } = req.body; // Extract categoryName from request body

  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: categoryName },
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    // console.error("Error updating category:", error.message);
    return res.status(500).json({ message: "Failed to update category." });
  }
};

export const updateSubCategory = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { subCategoryId } = req.params; // Extract subCategoryId from the request parameters
  const { subCategoryName } = req.body; // Extract subCategoryName from request body

  try {
    // Check if subcategory exists
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!existingSubCategory) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    // Update the subcategory
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data: { name: subCategoryName },
    });

    return res.status(200).json(updatedSubCategory);
  } catch (error) {
    // console.error("Error updating subcategory:", error.message);
    return res.status(500).json({ message: "Failed to update subcategory." });
  }
};
