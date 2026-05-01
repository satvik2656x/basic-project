import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });
    res.json(user);
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

app.listen(5000, () => console.log("Server running"));
