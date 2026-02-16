// server.js
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const movies = [
  { id: 1, title: "Dracula", year: 2010, rating: null },
  { id: 2, title: "Harry Potter", year: 2005, rating: null },
  { id: 3, title: "Anna Meier", year: 2003, rating: null }
];

app.get("/", (req, res) => {
  res.send("hello, world.");
});

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const title = movies.find(o => o.id === id)

  if (!title) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(title);
});

app.post("/movies", (req, res) => {
  const { title, year } = req.body;

  //
  if (!title || !year) {
    return res.status(400).json({ error: "Movie title and year of release are required!" });
  }
  // ID
  const newId = movies.length ? movies[movies.length - 1].id + 1 : 1;

  const newMovie = { id: newId, title, year};
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch("/movies/:id/rating", (req, res) => {
  const id = parseInt(req.params.id);
  const { rating } = req.body;
  const movie = movies.find(m => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  movie.rating = rating;
  res.json(movie);
});

app.delete("/movies/:id", (req, res) => {
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