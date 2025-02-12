// List of weekdays
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Store selected slots
let selectedSlots = {};

// Function to fetch available slots from backend
async function fetchAvailability() {
    try {
        // const response = await fetch("http://localhost:5000/get-available-slots");
        const availableSlots = await response.json();
        return availableSlots;
    } catch (error) {
        console.error("Error fetching availability:", error);
        return {};
    }
}

// Function to create the table dynamically
async function generateTable() {
    const tableBody = document.getElementById("slotsTable");
    tableBody.innerHTML = ""; // Clear existing table
    const availabilityData = await fetchAvailability();

    weekdays.forEach(day => {
        let row = document.createElement("tr");
        // availabilityData[Monday] =1;
        const isAvailable = availabilityData[day] > 0;
        const statusText = isAvailable ? "Available" : "Not Available";
        const statusClass = isAvailable ? "available" : "not-available";

        row.innerHTML = `
            <td>${day}</td>
            <td><input type="number" id="${day}" min="0" placeholder="Enter slots"></td>
            <td class="${statusClass}" id="status-${day}">${statusText}</td>
            <td id="action-${day}">
                ${isAvailable ? `
                    <button class="action-btn accept-btn" onclick="acceptSlot('${day}')">Accept</button>
                    <button class="action-btn decline-btn" onclick="declineSlot('${day}')">Decline</button>
                ` : ''}
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to handle slot acceptance
function acceptSlot(day) {
    const slotInput = document.getElementById(day).value;
    if (!slotInput || parseInt(slotInput) <= 0) {
        alert("Please enter a valid slot number!");
        return;
    }

    selectedSlots[day] = parseInt(slotInput);
    document.getElementById(`action-${day}`).innerHTML = `<span style="color: green;">Accepted</span>`;
}

// Function to handle slot decline
function declineSlot(day) {
    delete selectedSlots[day];
    document.getElementById(`action-${day}`).innerHTML = `
        <button class="action-btn accept-btn" onclick="acceptSlot('${day}')">Accept</button>
        <button class="action-btn decline-btn" onclick="declineSlot('${day}')">Decline</button>
    `;
}

// Function to handle submission
function submitRequest() {
    const userId = document.getElementById("userId").value;
    if (!userId) {
        alert("Please enter User ID!");
        return;
    }

    if (Object.keys(selectedSlots).length === 0) {
        alert("Please accept at least one slot!");
        return;
    }

    const requestData = {
        userId: userId,
        slots: selectedSlots
    };

    // Send data to backend
    fetch("http://localhost:5000/non-priority-user/request-slot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Slots booked successfully!");
        console.log(data);
        generateTable(); // Refresh table after submission
    })
    .catch(error => {
        console.error("Error booking slots:", error);
        alert("Failed to book slots.");
    });
}

// Call function to generate table on page load
generateTable();
