let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
// Fetch quotes from mock server
async function fetchQuotesFromServer() {
try {
const res = await fetch(SERVER_URL);
const data = await res.json();
return data.quotes.map(q => ({
text: q.quote,
category: q.author || "Uncategorized"
}));
} catch (error) {
console.error("Error fetching server quotes:", error);
return [];
}
}
async function postQuoteToServer(quote) {
try {
const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(quote)
});
if (!response.ok) {
throw new Error(`Server responded with status ${response.status}`);
}
const data = await response.json();
console.log("Quote posted to server:", data);
alert("Quote successfully posted to server!");
} catch (error) {
console.error("Error posting quote to server:", error);
alert("Failed to post quote to server.");
}
}
// after fetchQuotesFromServer and postQuoteToServer
async function syncQuotes() {
try {
// Fetch quotes from server
const serverQuotes = await fetchQuotesFromServer();
let conflictCount = 0;
let newAddCount = 0;
// Check for conflicts and new quotes
serverQuotes.forEach(serverQuote => {
const existingIndex = quotes.findIndex(localQuote => localQuote.text === serverQuote.text);
if (existingIndex !== -1) {
// Conflict: quote exists but category differs — server wins
if (quotes[existingIndex].category !== serverQuote.category) {
quotes[existingIndex].category = serverQuote.category;
conflictCount++;
}
} else {
// New quote from server
quotes.push(serverQuote);
newAddCount++;
}
});
if (conflictCount > 0 || newAddCount > 0) {
saveQuotes(); // Update local storage
populateCategories(); // Update categories UI
filterQuotes(); // Update displayed quotes
// Notify user about the sync result
alert(`Quotes synced with server!\nNew quotes added: ${newAddCount}\nConflicts
resolved: ${conflictCount}`);
}
} catch (error) {
console.error("Error syncing quotes:", error);
}
}
async function syncQuotes() {
try {
// Fetch quotes from server
const serverQuotes = await fetchQuotesFromServer();
let conflictCount = 0;
let newAddCount = 0;
// Check for conflicts and new quotes
serverQuotes.forEach(serverQuote => {
const existingIndex = quotes.findIndex(localQuote => localQuote.text === serverQuote.text);
if (existingIndex !== -1) {
// Conflict: quote exists but category differs — server wins
if (quotes[existingIndex].category !== serverQuote.category) {
quotes[existingIndex].category = serverQuote.category;
conflictCount++;
}
} else {
// New quote from server
quotes.push(serverQuote);
newAddCount++;
}
});
function startPeriodicSync(intervalMs = 60000) {
// Initial sync immediately
syncQuotes();
// Then sync every `intervalMs` milliseconds (default 60 seconds)
setInterval(syncQuotes, intervalMs);
}
if (conflictCount > 0 || newAddCount > 0) {
saveQuotes(); // Update local storage
populateCategories(); // Update categories UI
filterQuotes(); // Update displayed quotes
// Notify user about the sync result
alert(`Quotes synced from server:\nNew quotes added: ${newAddCount}\nConflicts
resolved: ${conflictCount}`);
}
} catch (error) {
console.error("Error syncing quotes:", error);
}
}
// Conflict detection and resolution (server wins)
function resolveConflicts(serverQuotes) {
let conflictCount = 0;
let newAddCount = 0;
serverQuotes.forEach(serverQuote => {
const existingIndex = quotes.findIndex(
localQuote => localQuote.text === serverQuote.text
);
if (existingIndex !== -1) {
const localQuote = quotes[existingIndex];
if (localQuote.category !== serverQuote.category) {
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
alert(`Data synced with server.\nNew quotes: ${newAddCount}\nConflicts resolved:
${conflictCount}`);
}
}
// Triggers periodic syncing
function startServerSync() {
syncWithServer(); // Initial sync
setInterval(syncWithServer, 60 * 1000);
}
// Main sync function
async function syncWithServer() {
const serverQuotes = await fetchServerQuotes();
resolveConflicts(serverQuotes);
}
// Load quotes from localStorage on startup
function loadQuotes() {
const storedQuotes = localStorage.getItem("quotes");
if (storedQuotes) {
quotes = JSON.parse(storedQuotes);
} else {
quotes = [
{ text: "The best way to get started is to quit talking and begin doing.", category:
"Motivation" },
{ text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
{ text: "Your time is limited, don't waste it living someone else's life.", category: "Life" }
];
saveQuotes();
}
}
// Save quotes to localStorage
function saveQuotes() {
localStorage.setItem("quotes", JSON.stringify(quotes));
}
// Populate category dropdown from quotes
function populateCategories() {
const categories = new Set(quotes.map(q => q.category));
const categoryFilter = document.getElementById("categoryFilter");
// Clear existing options except "All"
categoryFilter.innerHTML = '<option value="all">All Categories</option>';
categories.forEach(cat => {
const option = document.createElement("option");
option.value = cat;
option.textContent = cat;
categoryFilter.appendChild(option);
});
// Restore last selected filter if available
const savedFilter = localStorage.getItem("selectedCategory");
if (savedFilter) {
categoryFilter.value = savedFilter;
filterQuotes(); // Immediately apply the filter
}
}
// Filter quotes by selected category
function filterQuotes() {
const selected = document.getElementById("categoryFilter").value;
localStorage.setItem("selectedCategory", selected);
const quoteDisplay = document.getElementById("quoteDisplay");
quoteDisplay.innerHTML = "";
const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
if (filtered.length === 0) {
quoteDisplay.innerHTML = "<em>No quotes found for this category.</em>";
return;
}
filtered.forEach(quote => {
const div = document.createElement("div");
div.innerHTML = `<p>"${quote.text}"</p><small>Category:
<strong>${quote.category}</strong></small>`;
quoteDisplay.appendChild(div);
});
}
// Show a random quote (also saved in session)
function showRandomQuote() {
const quoteDisplay = document.getElementById("quoteDisplay");
if (quotes.length === 0) {
quoteDisplay.innerHTML = "<em>No quotes available. Please add one!</em>";
return;
}
const randomIndex = Math.floor(Math.random() * quotes.length);
const quote = quotes[randomIndex];
quoteDisplay.innerHTML = `
<p>"${quote.text}"</p>
<small>Category: <strong>${quote.category}</strong></small>
`;
sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}
// Restore last viewed quote during the session
function showLastViewedQuote() {
const last = sessionStorage.getItem("lastQuote");
if (last) {
const quote = JSON.parse(last);
const quoteDisplay = document.getElementById("quoteDisplay");
quoteDisplay.innerHTML = `
<p>"${quote.text}"</p>
<small>Category: <strong>${quote.category}</strong></small>
`;
}
}
// Form enhancement
function createAddQuoteForm() {
const quoteInput = document.getElementById("newQuoteText");
const categoryInput = document.getElementById("newQuoteCategory");
quoteInput.addEventListener("focus", () => {
if (quoteInput.value === "") quoteInput.placeholder = "Enter a new quote";
});
categoryInput.addEventListener("focus", () => {
if (categoryInput.value === "") categoryInput.placeholder = "Enter quote category";
});
}
// Add new quote
function addQuote() {
const textInput = document.getElementById("newQuoteText");
const categoryInput = document.getElementById("newQuoteCategory");
const newQuoteText = textInput.value.trim();
const newQuoteCategory = categoryInput.value.trim() || "Uncategorized";
if (newQuoteText === "") {
alert("Please enter a quote text.");
return;
}
const newQuote = { text: newQuoteText, category: newQuoteCategory };
quotes.push(newQuote);
saveQuotes();
populateCategories();
filterQuotes();
// Post new quote to server
postQuoteToServer(newQuote);
// Clear inputs
textInput.value = " ";
categoryInput.value = " ";
}
// Export quotes to JSON
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
// Import quotes from file
function importFromJsonFile(event) {
const fileReader = new FileReader();
fileReader.onload = function (event) {
try {
const importedQuotes = JSON.parse(event.target.result);
if (Array.isArray(importedQuotes)) {
quotes.push(...importedQuotes);
saveQuotes();
populateCategories();
filterQuotes();
alert("Quotes imported successfully!");
} else {
alert("Invalid JSON format.");
}
} catch (e) {
alert("Error reading JSON file.");
}
};
fileReader.readAsText(event.target.files[0]);
}
document.addEventListener("DOMContentLoaded", () => {
loadQuotes();
createAddQuoteForm();
populateCategories();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
showLastViewedQuote();
startPeriodicSync();
});