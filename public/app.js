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

      const tdName = document.createElement("td");
      tdName.textContent = o.name;

      const tdYear = document.createElement("td");
      tdYear.textContent = o.year;

      const tdRating = document.createElement("td");
      tdRating.textContent = o.rating;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Bearbeiten";
      editBtn.className = "edit-btn";

      editBtn.onclick = () => {
        // 1. Save original values in case user cancels (or for the inputs)
        const origTitle = tdName.textContent;
        const origYear = tdYear.textContent;
        const origRating = tdRating.textContent;

        // 2. Replace text with inputs
        const nameInput = document.createElement("input");
        nameInput.value = origTitle;
        tdName.innerHTML = "";
        tdName.appendChild(nameInput);

        const yearInput = document.createElement("input");
        yearInput.value = origYear;
        tdYear.innerHTML = "";
        tdYear.appendChild(yearInput);

        // This part makes the Rating editable!
        const ratingInput = document.createElement("input");
        ratingInput.type = "number"; // Set type to number for better UX
        ratingInput.value = origRating;
        tdRating.innerHTML = "";
        tdRating.appendChild(ratingInput);

        // 3. Change button to "Save"
        editBtn.textContent = "Save";

        editBtn.onclick = async () => {
          const newTitle = nameInput.value.trim();
          const newYear = yearInput.value.trim();
          const newRating = parseInt(ratingInput.value.trim());

          // Validation
          if (!newTitle || !newYear) {
            alert("Title and year required");
            return;
          }
          if (Number.isNaN(newRating) || newRating < 0 || newRating > 10) {
            alert("Rating must be a number between 0 and 10");
            return;
          }

          // 4. Send the updated data to the server
          await updateMovie(o.id, {
            name: newTitle,
            year: newYear,
            rating: newRating,
          });

          // 5. Refresh the list to show updated data and reset buttons
          await fetchMovies();
        };
      };
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";

      delBtn.onclick = async () => {
        if (!confirm(`Remove movie ${o.name}?`)) return;
        await deleteMovie(o.id);
        await fetchMovies();
      };

      const tdRemove = document.createElement("td");
      tdRemove.appendChild(delBtn);

      const tdEdit = document.createElement("td");
      tdEdit.appendChild(editBtn);

      tr.append(tdId, tdName, tdYear, tdRating, tdEdit, tdRemove);
      tbody.appendChild(tr);
    }

    statusEl.textContent = `Loaded a list of ${movies.length} movies`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error while loading the data.";
  }
}

async function addMovie(name, rating, year) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch("/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rating, year }),
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
  const nameInput = document.getElementById("movie-name");
  const name = nameInput.value.trim();
  const ratingInput = document.getElementById("movie-rating");
  const rating = ratingInput.value.trim();
  const yearInput = document.getElementById("movie-year");
  const year = yearInput.value.trim();
  const button = document.getElementById("add-btn");
  const statusEl = document.getElementById("status");

  if (!name || !year) {
    statusEl.textContent = "Movie name and year of release required.";
    return;
  }

  button.disabled = true;
  await addMovie(name, rating, year);
  button.disabled = false;

  nameInput.value = "";
  yearInput.value = "";
  ratingInput.value = "";
  nameInput.focus();
}

async function updateMovie(id, data) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch(`/movies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      throw new Error(msg.error || `HTTP ${res.status}`);
    }
    statusEl.textContent = `Movie ${id} aktualisiert.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Fehler beim Aktualisieren: ${err.message}`;
  }
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
