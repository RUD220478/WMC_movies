async function fetchMovies() {
  const statusEl = document.getElementById("status");
  const tbody = document.querySelector("#movies-table tbody");

  try {
    statusEl.textContent = "Loading List of movies...";

    const res = await fetch("/movies");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const movies = await res.json();
    tbody.innerHTML = "";

    for (const o of movies) {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = o.id;

      const tdTitle = document.createElement("td");
      tdTitle.textContent = o.title;

      const tdYear = document.createElement("td");
      tdYear.textContent = o.year;

      const tdRating = document.createElement("td");

      // If movie has been rated, show the rating
      if (o.rating != null) {
        tdRating.textContent = o.rating;
      } else {
        // Otherwise show a Rate button
        const rateBtn = document.createElement("button");
        rateBtn.textContent = "Rate";
        rateBtn.className = "rate-btn";

        rateBtn.onclick = async () => {
          const rating = prompt(`Give a rating for ${o.title} (1–5):`);
          // Error-Checking for input
          if (Number.isNaN(rating) || rating < 1 || rating > 5) {
            alert("Invalid. Please enter a number between 1 and 5.");
            return;
          }
          tdRating.textContent = rating;
        };
        tdRating.appendChild(rateBtn);
      }

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";

      delBtn.onclick = async () => {
        if (!confirm(`Remove movie ${o.title}?`)) return;
        await deleteMovie(o.id);
        await fetchMovies();
      };

      const tdRemove = document.createElement("td");
      tdRemove.appendChild(delBtn);

      tr.append(tdId, tdTitle, tdYear, tdRating, tdRemove);
      tbody.appendChild(tr);

    }

    statusEl.textContent = `Loaded a list of ${movies.length} movies`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error while loading the data.";
  }
}



async function addMovie(title, year) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch("/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, year }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchMovies();
    statusEl.textContent = "Movie added.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error while adding movie: ${err.message}`;
  }
}

async function addClick() {
  const titleInput   = document.getElementById("movie-title");
  const title = titleInput.value.trim();
  const yearInput = document.getElementById("movie-year");
  const year = yearInput.value.trim();
  const button = document.getElementById("add-btn");
  const statusEl = document.getElementById("status");

  if (!title || !year) {
    statusEl.textContent = "Movie title and year of release required.";
    return;
  }

  button.disabled = true;
  await addMovie(title, year);
  button.disabled = false;

  titleInput.value = "";
  yearInput.value = "";
  titleInput.focus();
}

async function deleteMovie(id) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch(`/movies/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      statusEl.textContent = `Movie ${id} removed.`;
    } else {
      throw new Error(msg.error || `HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error while removing: ${err.message}`;
  }
}

// When page isloaded the fetchMovies is called
window.addEventListener("DOMContentLoaded", fetchMovies);