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
  { id: 1, text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { id: 2, text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { id: 3, text: "Do not wait to strike till the iron is hot, but make it hot by striking.", category: "Motivation" },
];

let serverQuotes = []; // Simulated server-side state

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
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category!");
    return;
  }

  const newQuote = {
    id: Date.now(), // Unique ID for conflict resolution
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();

  // Send to server (simulated POST)
  syncWithServer("POST", newQuote);

  populateCategories();
  alert("Quote added successfully!");
  newQuoteText.value = "";
  newQuoteCategory.value = "";
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

  categoryFilter.value = getLastFilter();
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

  const firstQuote = filteredQuotes[0];
  quoteDisplay.innerHTML = `
    <p>"${firstQuote.text}"</p>
    <p class="category">- ${firstQuote.category}</p>
  `;
}

// ===============================
// SERVER SYNC (SIMULATION)
// ===============================
async function syncWithServer(method = "GET", data = null) {
  try {
    if (method === "GET") {
      // Simulate server fetch (using JSONPlaceholder)
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const serverData = await response.json();

      // Convert to quote-like objects
      serverQuotes = serverData.map(item => ({
        id: item.id,
        text: item.title,
        category: "ServerData"
      }));

      resolveConflicts();
    }

    if (method === "POST" && data) {
      // Simulate sending new quote
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
      });
      console.log("Quote synced to server:", data);
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}

// Conflict resolution: server > local (server wins)
function resolveConflicts() {
  let merged = [...quotes];

  serverQuotes.forEach(sq => {
    const exists = merged.find(lq => lq.id === sq.id);
    if (exists) {
      // Conflict: overwrite local with server
      Object.assign(exists, sq);
      notifyConflict(sq);
    } else {
      merged.push(sq);
    }
  });

  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Notify user of conflict resolution
function notifyConflict(quote) {
  alert(`Conflict resolved: Updated quote from server - "${quote.text}"`);
}

// Periodic sync every 20 seconds
setInterval(() => syncWithServer("GET"), 20000);

// ===============================
// JSON IMPORT / EXPORT
// (same as before)
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
syncWithServer("GET"); // Initial fetch
