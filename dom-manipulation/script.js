// ===============================
// STORAGE HELPERS
// ===============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  return storedQuotes ? JSON.parse(storedQuotes) : null;
}

function saveLastViewed(quote) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function getLastViewed() {
  const stored = sessionStorage.getItem("lastViewedQuote");
  return stored ? JSON.parse(stored) : null;
}

function saveLastFilter(category) {
  localStorage.setItem("lastSelectedCategory", category);
}

function getLastFilter() {
  return localStorage.getItem("lastSelectedCategory") || "all";
}

// ===============================
// INITIAL QUOTES
// ===============================
let quotes = loadQuotes() || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", category: "Motivation" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// ===============================
// QUOTE FUNCTIONS
// ===============================
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p class="category">- ${randomQuote.category}</p>
  `;

  // Save last viewed to session storage
  saveLastViewed(randomQuote);
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  // Update categories
  populateCategories();

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// ===============================
// FILTER FUNCTIONS
// ===============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last filter
  const lastFilter = getLastFilter();
  categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  saveLastFilter(selectedCategory);

  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  // Display the first matching quote by default
  const firstQuote = filteredQuotes[0];
  quoteDisplay.innerHTML = `
    <p>"${firstQuote.text}"</p>
    <p class="category">- ${firstQuote.category}</p>
  `;
}

// ===============================
// JSON IMPORT / EXPORT
// ===============================
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        populateCategories();
        filterQuotes();
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (error) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===============================
// EVENT LISTENERS
// ===============================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);

// ===============================
// INIT APP
// ===============================
populateCategories();
filterQuotes();
