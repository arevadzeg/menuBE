import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// Utility function to validate email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const registerUser = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { name, lastname, email, password } = req.body;

  // Validate email structure
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        lastname,
        email,
        password: hashedPassword,
        isActive: true,
        balance: 0,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    // Return user data and token
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "User creation failed" });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { email, password } = req.body;

  // Validate email structure
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    // Return user data and token
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
