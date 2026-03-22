import { PrismaClient } from "../generated/client.ts";

const prisma = new PrismaClient();

const movies = [
  { id: -1, name: "Inception", rating: 8, year: 2010 },
  { id: -2, name: "Interstellar", rating: 9.6, year: 2014 },
  { id: -3, name: "The Matrix", rating: 8.7, year: 1999 },
  { id: -4, name: "Gladiator", rating: 8.5, year: 2000 },
  { id: -5, name: "Titanic", rating: 7.8, year: 1997 },
  { id: -6, name: "Avatar", rating: 7.8, year: 2009 },
  { id: -7, name: "The Godfather", rating: 9.2, year: 1972 },
  { id: -8, name: "Pulp Fiction", rating: 8.9, year: 1994 },
  { id: -9, name: "Jurassic Park", rating: 8.1, year: 1993 },
  { id: -10, name: "Forrest Gump", rating: 8.8, year: 1994 },
];

async function main() {
  console.log("Remove old testdata...");

  const result = await prisma.movie.deleteMany({
    where: {
      id: { lt: 0 },
    },
  });
console.log(`Deleted ${result.count} movies with negative id`);

  console.log("Start seeding...");

  for (const movie of movies) {
    await prisma.movie.create({
      data: movie,
    });
    console.log(`Created movie with id: ${movie.id}`);
  }

  console.log("Seeding finished.");
}

try {
    await main();
}
catch (e) {
    console.error(e);
    Deno.exit(1);
}
finally {
    await prisma.$disconnect();
}