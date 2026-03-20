import express, { Request, Response } from "express";
import process from "node:process";
import { fromFileUrl } from "@std/path";
import { dirname } from "@std/path";
import path from "node:path";

const __dirname = dirname(fromFileUrl(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const movies = [
  { id: 1, title: "Dracula", year: 2010, rating: null },
  { id: 2, title: "Harry Potter", year: 2005, rating: null },
  { id: 3, title: "Anna Meier", year: 2003, rating: null }
];

app.get("/", (_req: Request, res: Response) => {
  res.send("hello, world.");
});

app.get("/movies", (req: Request, res: Response) => {
  res.json(movies);
});

app.get("/movies/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const title = movies.find(o => o.id === id)

  if (!title) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(title);
});

app.post("/movies", (req: Request, res: Response) => {
  const { title, year } = req.body;

  //
  if (!title || !year) {
    return res.status(400).json({ error: "Movie title and year of release are required!" });
  }
  // ID
  const newId = movies.length ? movies[movies.length - 1].id + 1 : 1;

  const newMovie = { id: newId, title, year, rating: null };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch("/movies/:id/rating", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { rating } = req.body;
  const movie = movies.find(m => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  movie.rating = rating;
  res.json(movie);
});

app.delete("/movies/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const pos = movies.findIndex(s => s.id === id);

  if (pos === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }
  // Removes the movie at the pos position
  movies.splice(pos, 1);
  // No content is returned
  return res.status(204).send(); // No Content
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});