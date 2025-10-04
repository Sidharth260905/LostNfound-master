// Selectors
const lostForm = document.getElementById("lostForm");
const searchInput = document.getElementById("search");
const resultsContainer = document.getElementById("results");

// Sample data for "found" items (for demo purposes)
const foundItems = [
  {
    itemName: "Water Bottle",
    color: "Blue",
    location: "Library",
    description: "Left on a table near the entrance",
  },
  {
    itemName: "Notebook",
    color: "Red",
    location: "Cafeteria",
    description: "Math notes inside",
  },
  {
    itemName: "Jacket",
    color: "Black",
    location: "Gym",
    description: "No description provided",
  },
];

// Function to debounce input events
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

// Function to submit the lost item form
if (lostForm) {
  lostForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const itemName = document.getElementById("itemName").value;
    const color = document.getElementById("color").value;
    const location = document.getElementById("location").value;
    const email = document.getElementById('email').value;
    const description =
      document.getElementById("description").value || "No description provided.";

    // Create the payload to send to the server
    const lostItemData = {
      itemName: itemName,
      color: color,
      email: email,
      location: location,
      description: description,
    };

    // Show loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.textContent = "Submitting...";
    lostForm.appendChild(loadingIndicator);

    // Send the data to the server
    fetch("http://localhost:3000/report-lost-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lostItemData), // Send data as JSON
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message); // Show success message
        lostForm.reset(); // Reset form fields
        lostForm.removeChild(loadingIndicator); // Remove loading indicator

        // Call the email sending function after successful submission
        sendEmail(itemName, color, location, description);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`Error reporting lost item: ${error.message || "Unknown error"}`);
        lostForm.removeChild(loadingIndicator); // Remove loading indicator
      });
  });
}

// Function to send an email (simulation)
function sendEmail(itemName, color, location, description) {
  // Simulate an email send
  console.log(`Email sent: New Lost Item - ${itemName}`);
  console.log(
    `Details:\nItem: ${itemName}\nColor: ${color}\nLocation: ${location}\nDescription: ${description}`
  );

  // In a real application, you would send this data to a backend to handle the email.
  alert(`Notification email has been circulated with the provided details!`);
}

lostForm.reset();

// Function to search found items
if (searchInput) {
  searchInput.addEventListener("input", debounce(function () {
    const query = searchInput.value.toLowerCase();
    displayResults(query);
  }, 300)); // 300ms delay

  searchInput.addEventListener("keydown", function (e) {
    console.log(`Key pressed: ${e.key}`); // Debugging
    if (e.key === "Enter") {
      e.preventDefault();
      alert(`Finding the best result for "${searchInput.value}"`);
    }
  });
}

// Function to display search results
function displayResults(query) {
  resultsContainer.innerHTML = ""; // Clear previous results

  const filteredItems = foundItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(query) ||
      item.color.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes (query)
  );

  if (filteredItems.length === 0) {
    resultsContainer.innerHTML = "<p>No items found matching your search.</p>";
    return;
  }

  // Create cards for each matched item
  filteredItems.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");
    itemCard.innerHTML = `
            <h3>${item.itemName}</h3>
            <p><strong>Color:</strong> ${item.color}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Description:</strong> ${item.description}</p>
            <button onclick="connectUser  ('${item.itemName}')" aria-label="Connect with the finder of ${item.itemName}">Connect with Finder</button>
        `;
    resultsContainer.appendChild(itemCard);
  });
}

// Function to simulate connecting with the finder
function connectUser (itemName) {
  alert(
    `Connecting you with the finder of "${itemName}". You can now chat anonymously to exchange details.`
  );
}