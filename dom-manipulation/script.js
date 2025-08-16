// ===============================
// HELPERS: Local + Session Storage
// ===============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
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
  { id: 1, text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { id: 2, text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { id: 3, text: "Do not wait to strike till the iron is hot, but make it hot by striking.", category: "Motivation" }
];
let serverQuotes = []; // Mock server state

// ===============================
// DOM Elements
// ===============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const notification = document.getElementById("notification");

// ===============================
// NOTIFICATIONS
// ===============================
function showNotification(msg, type = "info") {
  notification.textContent = msg;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => notification.style.display = "none", 5000);
}

// ===============================
// QUOTE DISPLAY
// ===============================
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (!filtered.length) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>"${random.text}"</p><p class="category">- ${random.category}</p>`;
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  if (!text || !category) {
    showNotification("Please enter both quote and category!", "warning");
    return;
  }

  const newQuote = { id: Date.now(), text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  // Simulate sending to server
  syncWithServer("POST", newQuote);

  showNotification("Quote added locally & sent to server.", "info");
  newQuoteText.value = newQuoteCategory.value = "";
}

// ===============================
// FILTERING
// ===============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.value = getLastFilter();
}
function filterQuotes() {
  saveLastFilter(categoryFilter.value);
  showRandomQuote();
}

// ===============================
// SERVER SYNC (MOCK)
// ===============================
async function syncWithServer(method = "GET", data = null) {
  try {
    if (method === "GET") {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const serverData = await res.json();
      serverQuotes = serverData.map(item => ({
        id: item.id,
        text: item.title,
        category: "ServerData"
      }));
      resolveConflicts();
    }
    if (method === "POST" && data) {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      console.log("Synced to server:", data);
    }
  } catch (err) {
    showNotification("Sync error: " + err.message, "warning");
  }
}

// Conflict resolution: server wins
function resolveConflicts() {
  let merged = [...quotes];
  serverQuotes.forEach(sq => {
    const local = merged.find(lq => lq.id === sq.id);
    if (local) {
      Object.assign(local, sq); // server overwrites local
      showNotification(`Conflict resolved: "${sq.text}" updated from server.`, "warning");
    } else {
      merged.push(sq);
    }
  });
  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// ===============================
// JSON IMPORT/EXPORT
// ===============================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "quotes.json"; a.click();
  URL.revokeObjectURL(url);
}
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes(); populateCategories(); filterQuotes();
        showNotification("Quotes imported successfully!", "info");
      }
    } catch {
      showNotification("Invalid JSON file!", "warning");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ===============================
// EVENTS
// ===============================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);

// ===============================
// INIT
// ===============================
populateCategories();
filterQuotes();
syncWithServer("GET");         // initial sync
setInterval(() => syncWithServer("GET"), 20000); // periodic sync
