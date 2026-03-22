import express, { Request, Response } from "express";
import process from "node:process";
import { fromFileUrl } from "@std/path";
import { dirname } from "@std/path";
import path from "node:path";
import { PrismaClient } from "./generated/client.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const prisma = new PrismaClient();

const movies = await prisma.movie.findMany();

app.get("/", (_req: Request, res: Response) => {
  res.send("hello, world.");
});

app.get("/movies", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});

app.get("/movies/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const movie = await prisma.movie.findUnique({
    where: { id }
  });
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  res.json(movie);
});

app.put("/movies/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, year } = req.body;
  if (!name || !year) {
    return res.status(400).json({ error: "Name and year are required!" });
  }
  try {
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: { name, year: Number(year) }
    });
    res.json(updatedMovie);
  } catch {
    return res.status(404).json({ error: "Movie not found" });
  }
});

app.post("/movies", async (req: Request, res: Response) => {
  const { name, rating, year } = req.body;
  console.log("Received POST /movies with data:", req.body);
  if (!name || !year) {
    return res.status(400).json({ error: "Name, rating and year are required!" });
  }
  const newMovie = await prisma.movie.create({
    data: { name, year: Number(year), rating: Number(rating) }
  });
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, rating, year } = req.body;

  const data: { name?: string; rating?: number; year?: number } = {};

  if (name !== undefined) data.name = name;
  if (rating !== undefined) data.rating = rating;
  if (year !== undefined) data.year = Number(year);

  try {
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data
    });

    res.json(updatedMovie);
  } catch {
    return res.status(404).json({ error: "Movie not found" });
  }
});

app.delete("/movies/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.movie.delete({
      where: { id }
    });
    return res.status(204).send(); // No Content
  } catch {
    return res.status(404).json({ error: "Movie not found" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});