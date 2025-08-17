// ===== Global Variables =====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ===== Save & Load from Local Storage =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem("quotes"));
  if (storedQuotes) quotes = storedQuotes;
}

// ===== Add New Quote =====
function addQuote() {
  const textInput = document.getElementById("quoteText");
  const categoryInput = document.getElementById("quoteCategory");

  const newQuote = {
    text: textInput.value,
    category: categoryInput.value
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = "";
  categoryInput.value = "";
}

// ===== Populate Categories Dropdown =====
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

// ===== Filter Quotes by Category =====
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteList = document.getElementById("quoteList");

  localStorage.setItem("selectedCategory", selectedCategory);

  quoteList.innerHTML = "";
  quotes.forEach(q => {
    if (selectedCategory === "all" || q.category === selectedCategory) {
      const li = document.createElement("li");
      li.textContent = `${q.text} (${q.category})`;
      quoteList.appendChild(li);
    }
  });
}

// ===== Export Quotes as JSON =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ===== Import Quotes from JSON =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Fetch Quotes from Fake Server =====
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

// ===== Sync with Server (Conflict Resolution: Server Wins) =====
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflictCount = 0;
    let newAddCount = 0;

    serverQuotes.forEach(serverQuote => {
      const existingIndex = quotes.findIndex(localQuote => localQuote.text === serverQuote.text);
      if (existingIndex !== -1) {
        if (quotes[existingIndex].category !== serverQuote.category) {
          quotes[existingIndex].category = serverQuote.category; // Server wins
          conflictCount++;
        }
      } else {
        quotes.push(serverQuote);
        newAddCount++;
      }
    });

    if (conflictCount > 0 || newAddCount > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert(`Quotes synced!\nNew: ${newAddCount}\nConflicts resolved: ${conflictCount}`);
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// ===== Periodic Sync =====
function startPeriodicSync(intervalMs = 60000) {
  syncQuotes(); // run immediately
  setInterval(syncQuotes, intervalMs); // repeat
}

// ===== Initialize App =====
window.onload = function() {
  loadQuotes();
  populateCategories();
  filterQuotes();
  startPeriodicSync(30000); // every 30s
};
