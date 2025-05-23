/**
 * Server Updates Manager
 * Fetches the latest updates from a local JSON file source
 * and displays them in the server updates tab
 */

// Configuration
const CONFIG = {
    // Maximum number of updates to display
    maxUpdates: 3,

    // Source for updates (local JSON file)
    updatesUrl: "updates.json", // Local JSON file

    // Update check interval (in milliseconds) - only applies when auto-refresh is enabled
    refreshInterval: 300000, // 5 minutes

    // Enable auto-refresh of updates
    autoRefresh: false
};

// DOM Elements
const updatesList = document.getElementById('updates-list');
const updateLoader = document.querySelector('.update-loader');

// Icon mapping for different update types
const updateIcons = {
    "announcement": "fa-bullhorn",
    "update": "fa-sync-alt",
    "event": "fa-calendar-alt",
    "feature": "fa-star",
    "fix": "fa-wrench",
    "news": "fa-newspaper",
    "default": "fa-info-circle"
};

/**
 * Initialize the server updates functionality
 */
function initServerUpdates() {
    loadServerUpdates();

    // Set up auto-refresh if enabled
    if (CONFIG.autoRefresh) {
        setInterval(loadServerUpdates, CONFIG.refreshInterval);
    }
}

/**
 * Load server updates from the configured source
 */
// Explicitly set the fetch method to GET and add more debugging logs
function loadServerUpdates() {
    console.log("Attempting to fetch updates from:", CONFIG.updatesUrl);

    fetch(CONFIG.updatesUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Fetched updates successfully:", data);
        displayUpdates(data.updates || []);
    })
    .catch(error => {
        console.error("Error during fetch:", error);
        displayErrorMessage("Failed to load updates. Please try again later.");
    });
}

/**
 * Display updates in the updates list
 * @param {Array} updates Array of update objects
 */
function displayUpdates(updates) {
    // Hide loader
    if (updateLoader) {
        updateLoader.style.display = 'none';
    }

    // Clear current updates
    if (updatesList) {
        updatesList.innerHTML = '';

        if (updates.length === 0) {
            displayErrorMessage("No updates available at this time.");
            return;
        }

        // Loop through updates and create elements
        updates.slice(0, CONFIG.maxUpdates).forEach(update => {
            const updateCard = createUpdateCard(update);
            updatesList.appendChild(updateCard);
        });
    }
}

/**
 * Create an update card element
 * @param {Object} update Update object
 * @returns {HTMLElement} Update card element
 */
function createUpdateCard(update) {
    const card = document.createElement('div');
    card.className = 'update-card';

    // Determine icon
    const iconClass = updateIcons[update.type] || updateIcons.default;

    // Format date
    const dateFormatted = formatDate(update.date);

  // Create HTML for update card
    card.innerHTML = `
        <div class="update-header">
            <div class="update-icon">
            </div>
            <div class="update-info">
                <div class="update-meta">
                    </div>
                    <div class="update-author">
                    </div>
                </div>
            </div>
        </div>
		    <div class="update-title-banner"><i class="fas fa-calendar">&nbsp;</i>${update.title}</div>
        <div class="update-content">${formatUpdateContent(update.content)}</div>
    `;

    return card;
}

/**
 * Create HTML for update images
 * @param {Array} images Array of image URLs
 * @returns {string} HTML for images
 */
function createImagesHTML(images) {
    if (!images || images.length === 0) return '';

    let html = '<div class="update-images">';
    images.forEach(image => {
        html += `<img src="${image}" alt="Update image" class="update-image">`;
    });
    html += '</div>';

    return html;
}

/**
 * Display error message
 * @param {string} message Error message
 */
function displayErrorMessage(message) {
    // First show error animation in loader
    if (updateLoader) {
        updateLoader.innerHTML = `
            <div class="loading-spinner error">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div>${message}</div>
            <div class="retry-button">
                <button onclick="loadServerUpdates()" class="update-retry-btn">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        `;
    }

    // Also display in the updates list for consistency
    if (updatesList) {
        updatesList.innerHTML = '';
    }
}

/**
 * Format update content - handles basic markdown-like formatting
 * @param {string} content Raw content
 * @returns {string} Formatted HTML content
 */
function formatUpdateContent(content) {
    if (!content) return '';

    // Handle basic formatting
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
        .replace(/~~(.*?)~~/g, '<s>$1</s>')                // Strikethrough
        .replace(/__(.*?)__/g, '<u>$1</u>')                // Underline
        .replace(/\n/g, '<br>');                           // Line breaks

    return formatted;
}

/**
 * Format date in a user-friendly way
 * @param {Date|string} date Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    if (!date) return 'Unknown date';

    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Unknown date';

    // Format options
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };

    return dateObj.toLocaleDateString(undefined, options);
}

// Initialize updates on page load
document.addEventListener('DOMContentLoaded', function() {
    initServerUpdates();

    // Add tab switching event to ensure updates are properly displayed
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'server-updates') {
                // Ensure updates are displayed properly when tab is selected
                if (updatesList && updatesList.children.length === 0) {
                    loadServerUpdates();
                }
            }
        });
    });
});
