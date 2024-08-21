
const apiKey = "GQ3jXKM8wGlbsOJuMKNb2VHQbGcrTAIEBM0MTaoLLUdyXsPE63r82sJJ";
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const firstImageSection = document.getElementById("first-image");
const similarResultsSection = document.getElementById("similar-results");
const favoritesSection = document.getElementById("favorites");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Hide the sections initially
document.getElementById("similar-results-section").style.display = "none";
document.getElementById("favorites-section").style.display = "none";

searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value;
  fetchImages(searchTerm);
});

async function fetchImages(searchTerm) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${searchTerm}`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );
  const data = await response.json();
  displayFirstImage(data.photos[0]);
  displaySimilarResults(data.photos);
}

function displayFirstImage(image) {
  firstImageSection.innerHTML = `
        <div class="flex items-center gap-10">
            <div class="w-[476px] h-[335px]">
                <img src="${image.src.medium}" alt="${image.alt}" class="w-full h-full rounded mb-4" />
            </div>
            <div class="flex flex-col gap-3">
                <h3 class="text-2xl font-bold">${image.alt}</h3>
                <div>
                    <p class="text-red-600 mb-3">Photographer: ${image.photographer}</p>
                    <a href="${image.photographer_url}" target="_blank" class="text-sm md:text-base text-white px-4 py-2 bg-red-600">Explore more</a>
                </div>
            </div>
        </div>`;
}

function displaySimilarResults(images) {
  const similarResultsSection = document.getElementById(
    "similar-results-section"
  );
  const similarResults = document.getElementById("similar-results");

  if (images.length > 1) {
    // More than one image means we have similar results
    similarResultsSection.style.display = "block"; // Show the section
    similarResults.innerHTML = ""; // Clear the list

    images.forEach((image, index) => {
      if (index === 0) return; // Skip the first image since it's displayed separately

      const imageCard = document.createElement("li");
      imageCard.classList.add("splide__slide");
      imageCard.innerHTML = `
                <div class="relative border pb-3 rounded bg-white w-[300px] h-[433px] mx-auto">
                    <img src="${image.src.medium}" alt="${image.alt}" class="w-full h-[80%] rounded mb-4">
                    <button class="wishlist-button absolute top-2 right-2 bg-gray-200 p-2 rounded-full" data-index="${index}">
                        🩶
                    </button>
                    <div class="px-2">
                    <h3 class="font-semibold">${image.alt}</h3>
                    <p class="text-gray-600">Photographer: ${image.photographer}</p>
                    </div>
                </div>`;
      similarResults.appendChild(imageCard);
    });

    new Splide("#similar-results-slider", {
      type: "loop",
      perPage: 5,
      gap: "1rem",
      pagination: false,
      breakpoints: {
        1300: {
            perPage: 4,
        },
        1024: {
          perPage: 3, // Number of slides per page for medium screens
        },
        900: {
          perPage: 2, // Number of slides per page for small screens
        },
        600: {
            perPage: 1,
        }
      },
    }).mount();

    attachWishlistListeners();
  } else {
    similarResultsSection.style.display = "none"; // Hide the section if no similar results
  }
}

function attachWishlistListeners() {
  const wishlistButtons = document.querySelectorAll(".wishlist-button");
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const card = event.target.closest(".relative"); // Find the closest parent element with the 'relative' class
      const image = card.querySelector("img"); // Find the image within the same card
      const imageData = {
        src: image.src,
        alt: image.alt,
        photographer: card.querySelector("p.text-gray-600").textContent, // Photographer's name
      };

      // Add to favorites
      addToFavorites(imageData);

      // Remove the item from the Similar Results section
      card.parentElement.remove();

      // Re-initialize the Splide slider for similar results
      const splide = document.querySelector("#similar-results-slider").splide;
      splide.refresh();
    });
  });
}

function addToFavorites(image) {
  favorites.push(image);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Attach event listener for the sort options
document.getElementById("sort-options").addEventListener("change", function () {
  const sortBy = this.value;
  sortFavorites(sortBy);
});

// Function to sort the favorites array and re-render it
function sortFavorites(sortBy) {
  favorites.sort((a, b) => {
    if (sortBy === "title") {
      return a.alt.localeCompare(b.alt); // Sort by alt text
    } else if (sortBy === "alt") {
      return a.alt.localeCompare(b.alt); // Sort by alt text (same as title in this case)
    }
  });

  renderFavorites(); // Re-render the favorites section after sorting
}

// Function to render the favorites section
function renderFavorites() {
  const favoritesSection = document.getElementById("favorites-section");
  const favoritesElement = document.getElementById("favorites");

  if (favorites.length > 0) {
    favoritesSection.style.display = "block"; // Show the section
    favoritesElement.innerHTML = ""; // Clear the list

    favorites.forEach((image, index) => {
      const imageCard = document.createElement("li");
      imageCard.classList.add("splide__slide");
      imageCard.innerHTML = `
                <div class="pb-3 relative border rounded bg-white w-[300px] h-[433px] mx-auto">
                    <img src="${image.src}" alt="${image.alt}" class="w-full h-[80%] rounded mb-4">
                    <button class="wishlist-button absolute top-1 right-5 bg-gray-200 p-2 rounded-full" data-index="${index}">
                        ❤️
                    </button>
                    <div class="px-2 overflow-x-scroll">
                        <h3 class="font-semibold">${image.alt}</h3>
                        <p class="text-gray-600">Photographer: ${image.photographer}</p>
                    </div>
                </div>`;
      favoritesElement.appendChild(imageCard);
    });

    new Splide("#favorites-slider", {
      perPage: 5,
      gap: "1rem",
      pagination: false,
      breakpoints: {
        1300: {
            perPage: 4,
        },
        1024: {
          perPage: 3, // Number of slides per page for medium screens
        },
        900: {
          perPage: 2, // Number of slides per page for small screens
        },
        600: {
            perPage: 1,
        }
      },
    }).mount();

    attachRemoveListeners();
  } else {
    favoritesSection.style.display = "none"; // Hide the section if no favorites
  }
}

function attachRemoveListeners() {
  const removeButtons = document.querySelectorAll(".wishlist-button");
  removeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.dataset.index;
      removeFromFavorites(index);
    });
  });
}

// Initial render of favorites
renderFavorites();
