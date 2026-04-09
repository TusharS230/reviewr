// Point this to your Spring Boot server
const API_BASE_URL = "http://localhost:8080/api";

// Grab the empty container from the HTML
const gridContainer = document.getElementById("snippets-grid");

// The Main Function
async function fetchAndDisplaySnippets() {
  try {
    // 1. Call the Backend
    const response = await fetch(`${API_BASE_URL}/snippets`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    // 2. Parse the JSON
    const snippets = await response.json();

    // 3. Clear the "Loading..." text
    gridContainer.innerHTML = "";

    if (snippets.length === 0) {
      gridContainer.innerHTML = `<p class="loading-state">No snippets found in the database. Go to Postman and POST some!</p>`;
      return;
    }

    // 4. Loop through the data and create HTML cards
    snippets.forEach((snippet) => {
      const card = document.createElement("div");
      card.className = "card";

      // Note: Make sure snippet.snippet_title matches your backend DTO or Model!
      // If your backend just returns "title", change it to ${snippet.title}
      card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${snippet.snippet_title || snippet.title || "Untitled Snippet"}</div>
                    <span class="badge">${snippet.language}</span>
                </div>
                <div class="code-block">${snippet.content}</div>
                <button class="btn" onclick="viewReviews(${snippet.id})">
                  View Reviews
                </button>
            `;

      gridContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    gridContainer.innerHTML = `
            <div class="loading-state" style="color: #DC2626;">
                <h3>Connection Failed</h3>
                <p>Could not connect to the backend. Is Spring Boot running on port 8080?</p>
            </div>
        `;
  }
}

// Run the function immediately when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplaySnippets();
});

// --- Modal Logic ---
const modal = document.getElementById("add-modal");
const openBtn = document.getElementById("nav-add-btn");
const closeBtn = document.getElementById("close-modal");
const form = document.getElementById("add-snippet-form");

// Open and Close the Modal
openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

// Close if user clicks outside the white box
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// --- The POST Request ---
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from refreshing!

  // 1. Gather the data from the inputs
  const newSnippet = {
    snippet_title: document.getElementById("input-title").value,
    language: document.getElementById("input-language").value,
    content: document.getElementById("input-content").value,
    user: { id: 1 }, // Hardcoding Tushar's user ID for now!
  };

  try {
    // 2. Send the POST request to Spring Boot
    const response = await fetch(`${API_BASE_URL}/snippets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tell Java we are sending JSON
      },
      body: JSON.stringify(newSnippet), // Convert our JS object to a JSON string
    });

    if (!response.ok) {
      throw new Error(`Server rejected request: ${response.status}`);
    }

    // 3. Success! Clean up the UI
    form.reset(); // Clear the inputs
    modal.classList.add("hidden"); // Close the modal
    fetchAndDisplaySnippets(); // Immediately refresh the dashboard!
  } catch (error) {
    console.error("Error saving snippet:", error);
    alert("Failed to save the snippet. Check the console.");
  }
});

// --- View Reviews Logic ---
const reviewsModal = document.getElementById("reviews-modal");
const closeReviewsBtn = document.getElementById("close-reviews-modal");
const reviewsContainer = document.getElementById("reviews-container");

// Close the modal
closeReviewsBtn.addEventListener("click", () =>
  reviewsModal.classList.add("hidden"),
);
window.addEventListener("click", (e) => {
  if (e.target === reviewsModal) reviewsModal.classList.add("hidden");
});

// Fetch and display reviews
async function viewReviews(snippetId) {
  // 1. Open the modal and show loading state
  reviewsModal.classList.remove("hidden");
  reviewsContainer.innerHTML =
    '<div class="loading-state">Fetching reviews...</div>';

  try {
    // 2. Call the backend
    const response = await fetch(
      `${API_BASE_URL}/reviews/snippet/${snippetId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    // 3. Parse the ReviewDTOs
    const reviews = await response.json();
    reviewsContainer.innerHTML = ""; // Clear the loading text

    // 4. Handle empty state
    if (reviews.length === 0) {
      reviewsContainer.innerHTML =
        '<p style="text-align: center; color: #6B7280;">No reviews yet. Be the first to review this snippet!</p>';
      return;
    }

    // 5. Loop through and build the review UI
    reviews.forEach((review) => {
      const reviewElement = document.createElement("div");
      reviewElement.className = "review-card";

      // Notice how we use the exact fields from your ReviewDTO!
      reviewElement.innerHTML = `
                <div class="review-header">
                    <span>👤 <strong>${review.authorName}</strong></span>
                    <span class="review-rating">⭐ ${review.rating}/5</span>
                </div>
                <div class="review-comment">
                    "${review.comment}"
                </div>
            `;

      reviewsContainer.appendChild(reviewElement);
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsContainer.innerHTML =
      '<p style="color: red; text-align: center;">Could not load reviews.</p>';
  }
}
