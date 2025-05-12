/**
 * Server Updates Manager
 * Fetches the latest updates from a Discord channel or text file source
 * and displays them in the server updates tab
 */

// Configuration
const CONFIG = {
    // Maximum number of updates to display
    maxUpdates: 3,
    
    // Primary source (Discord Webhook URL - read only)
    // Note: Discord webhook URLs are read-only when you remove /github from the URL
    // Format: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN/messages
    discordWebhookUrl: "https://discord.com/api/webhooks/1371288166279024690/4mIxO5f12sWPVYpv4fUHUsSjFFdaFmgAR3xnIycGp1AZbQSfVmPDde8I1K4d9D7drqMR/messages", // Discord webhook URL
    
    // Fallback source (Text or JSON file)
    fallbackUpdateUrl: "updates.json", // Fallback to a local JSON file
    
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
function loadServerUpdates() {
    // Show loader with initial loading state
    if (updateLoader) {
        updateLoader.style.display = 'flex';
        updateLoader.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div>Loading updates...</div>
        `;
    }
    
    // Try Discord webhook first if configured
    if (CONFIG.discordWebhookUrl) {
        // Show connecting state
        if (updateLoader) {
            updateLoader.innerHTML = `
                <div class="loading-spinner connecting">
                    <i class="fas fa-cloud-download-alt"></i>
                </div>
                <div>Connecting to server...</div>
                <div class="connecting-status">
                    <div class="connecting-dots">
                        <div class="connecting-dot"></div>
                        <div class="connecting-dot"></div>
                        <div class="connecting-dot"></div>
                    </div>
                </div>
            `;
        }
        
        fetchDiscordUpdates()
            .then(updates => {
                displayUpdates(updates);
            })
            .catch(error => {
                console.error("Error fetching Discord updates:", error);
                // Show reconnecting to fallback message
                if (updateLoader) {
                    updateLoader.innerHTML = `
                        <div class="loading-spinner connecting">
                            <i class="fas fa-sync-alt"></i>
                        </div>
                        <div>Connection failed. Trying alternate source...</div>
                        <div class="connecting-status">
                            <div class="connecting-dots">
                                <div class="connecting-dot"></div>
                                <div class="connecting-dot"></div>
                                <div class="connecting-dot"></div>
                            </div>
                        </div>
                    `;
                }
                
                // Wait a moment to show the reconnecting message before trying fallback
                setTimeout(() => {
                    // Fall back to local updates file
                    fetchLocalUpdates();
                }, 1500); // 1.5 seconds delay to show reconnecting message
            });
    } else {
        // Use local updates file directly
        fetchLocalUpdates();
    }
}

/**
 * Fetch updates from Discord webhook
 * @returns {Promise<Array>} Array of update objects
 */
function fetchDiscordUpdates() {
    return new Promise((resolve, reject) => {
        fetch(CONFIG.discordWebhookUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Process Discord webhook data into our update format
                const updates = data.messages || [];
                const formattedUpdates = updates.slice(0, CONFIG.maxUpdates).map(message => {
                    return {
                        type: detectUpdateType(message.content),
                        title: extractTitle(message.content),
                        content: message.content,
                        date: new Date(message.timestamp),
                        author: message.author?.username || "Server Admin",
                        images: message.attachments?.map(a => a.url) || []
                    };
                });
                resolve(formattedUpdates);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Fetch updates from local JSON file
 */
function fetchLocalUpdates() {
    // Show connecting animation for local updates
    if (updateLoader) {
        updateLoader.innerHTML = `
            <div class="loading-spinner connecting">
                <i class="fas fa-database"></i>
            </div>
            <div>Retrieving updates...</div>
            <div class="connecting-status">
                <div class="connecting-dots">
                    <div class="connecting-dot"></div>
                    <div class="connecting-dot"></div>
                    <div class="connecting-dot"></div>
                </div>
            </div>
        `;
    }
    
    fetch(CONFIG.fallbackUpdateUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayUpdates(data.updates || []);
        })
        .catch(error => {
            console.error("Error fetching local updates:", error);
            displayErrorMessage("Could not load server updates. Please try again later.");
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
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="update-info">
                <div class="update-title">${update.title}</div>
                <div class="update-meta">
                    <div class="update-date">
                        <i class="fas fa-calendar"></i>
                        <span>${dateFormatted}</span>
                    </div>
                    <div class="update-author">
                        <i class="fas fa-user"></i>
                        <span>${update.author}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="update-content">${formatUpdateContent(update.content)}</div>
        ${update.images && update.images.length > 0 ? createImagesHTML(update.images) : ''}
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
 * Extract title from content
 * @param {string} content Raw content
 * @returns {string} Extracted title
 */
function extractTitle(content) {
    if (!content) return 'Server Update';
    
    // Look for the first line as title
    const lines = content.split('\n');
    if (lines.length > 0) {
        // Remove any markdown from the first line
        let title = lines[0]
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/~~/g, '')
            .replace(/__/g, '')
            .trim();
        
        // If title is too long, truncate it
        if (title.length > 60) {
            title = title.substring(0, 57) + '...';
        }
        
        return title;
    }
    
    return 'Server Update';
}

/**
 * Detect update type based on content
 * @param {string} content Update content
 * @returns {string} Update type
 */
function detectUpdateType(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('announcement') || lowerContent.includes('attention') || lowerContent.includes('important')) {
        return 'announcement';
    }
    
    if (lowerContent.includes('event') || lowerContent.includes('competition')) {
        return 'event';
    }
    
    if (lowerContent.includes('update') || lowerContent.includes('version') || lowerContent.includes('changelog')) {
        return 'update';
    }
    
    if (lowerContent.includes('new feature') || lowerContent.includes('added')) {
        return 'feature';
    }
    
    if (lowerContent.includes('fix') || lowerContent.includes('bug') || lowerContent.includes('resolved')) {
        return 'fix';
    }
    
    if (lowerContent.includes('news')) {
        return 'news';
    }
    
    return 'default';
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
