/**
 * GTA-Style Getaway Driver Minigame - NCHub Loading Screen
 * Version 1.0.0
 * Created for NC Loading Screen V4
 * Inspired by Grand Theft Auto
 */

// Game settings and variables
const GAME_SETTINGS = {
    roadSpeed: 5,
    carSpeed: 10,
    obstacleSpeed: 4,
    obstacleFrequency: 1500,
    coinFrequency: 3000
};

let game = {
    isActive: false,
    score: 0,
    bestScore: localStorage.getItem('gtaGameBestScore') ? parseInt(localStorage.getItem('gtaGameBestScore')) : 0,
    stars: 3,
    roadPosition: 0,
    playerPosition: 50, // Percent from left
    obstacles: [],
    coins: [],
    timers: {
        roadAnimation: null,
        obstacleGenerator: null,
        coinGenerator: null,
        collisionDetection: null
    }
};

// DOM Elements
const gameArea = document.getElementById('gta-game-area');
const playerCar = document.getElementById('gta-player-car');
const gameMessage = document.getElementById('gta-game-message');
const scoreDisplay = document.getElementById('gta-game-score');
const bestScoreDisplay = document.getElementById('gta-game-best');
const wantedDisplay = document.getElementById('gta-game-wanted');
const obstaclesContainer = document.getElementById('gta-obstacles');
const roadLines = document.querySelectorAll('.gta-road-line');

// Initialize the game
function initGTAGame() {
    console.log('[GTA Minigame] Initialized');
    
    // Update displays
    updateScoreDisplay();
    updateWantedStars();
    
    // Set initial positions
    gameMessage.style.display = 'block';
    playerCar.style.left = `${game.playerPosition}%`;
    
    // Load best score
    bestScoreDisplay.textContent = game.bestScore;
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Add click event listener to game message
    gameMessage.addEventListener('click', function() {
        if (!game.isActive) {
            startGame();
        }
    });
}

// Start the game
function startGame() {
    if (game.isActive) return;
    
    // Reset game state
    resetGame();
    
    // Hide start message
    gameMessage.style.display = 'none';
    
    // Start animations and timers
    game.isActive = true;
    game.timers.roadAnimation = setInterval(animateRoad, 50);
    game.timers.obstacleGenerator = setInterval(generateObstacle, GAME_SETTINGS.obstacleFrequency);
    game.timers.coinGenerator = setInterval(generateCoin, GAME_SETTINGS.coinFrequency);
    game.timers.collisionDetection = setInterval(checkCollisions, 50);
}

// Reset game to initial state
function resetGame() {
    game.isActive = false;
    game.score = 0;
    game.stars = 3;
    game.roadPosition = 0;
    game.playerPosition = 50;
    game.obstacles = [];
    game.coins = [];
    
    // Clear all timers
    Object.values(game.timers).forEach(timer => {
        if (timer) clearInterval(timer);
    });
    
    // Clear obstacles and coins
    obstaclesContainer.innerHTML = '';
    
    // Reset car position
    playerCar.style.left = `${game.playerPosition}%`;
    
    // Reset displays
    updateScoreDisplay();
    updateWantedStars();
}

// End the game
function endGame() {
    game.isActive = false;
    
    // Clear all timers
    Object.values(game.timers).forEach(timer => {
        if (timer) clearInterval(timer);
    });
    
    // Add game over effect
    gameArea.classList.add('gta-game-over');
    setTimeout(() => {
        gameArea.classList.remove('gta-game-over');
    }, 1500);
    
    // Show game over message
    gameMessage.innerHTML = `BUSTED<br><div class="gta-controls-hint">PRESS SPACE TO RESTART</div>`;
    gameMessage.style.display = 'block';
    
    // Update best score if needed
    if (game.score > game.bestScore) {
        game.bestScore = game.score;
        localStorage.setItem('gtaGameBestScore', game.bestScore);
        bestScoreDisplay.textContent = game.bestScore;
    }
}

// Generate a new obstacle
function generateObstacle() {
    if (!game.isActive) return;
    
    const obstacleTypes = ['car', 'police', 'truck'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    const obstacle = document.createElement('div');
    obstacle.className = `gta-obstacle ${type}`;
    
    // Random position between 10% and 90% of road width
    const position = 10 + Math.random() * 80;
    obstacle.style.left = `${position}%`;
    
    obstaclesContainer.appendChild(obstacle);
    
    game.obstacles.push({
        element: obstacle,
        position: position,
        type: type,
        top: -80
    });
}

// Generate a new coin
function generateCoin() {
    if (!game.isActive) return;
    
    const coin = document.createElement('div');
    coin.className = 'gta-coin';
    
    // Random position between 10% and 90% of road width
    const position = 10 + Math.random() * 80;
    coin.style.left = `${position}%`;
    
    obstaclesContainer.appendChild(coin);
    
    game.coins.push({
        element: coin,
        position: position,
        top: -30
    });
}

// Animate road (moving road lines)
function animateRoad() {
    if (!game.isActive) return;
    
    game.roadPosition += GAME_SETTINGS.roadSpeed;
    if (game.roadPosition >= 100) {
        game.roadPosition = 0;
    }
    
    // Update road line positions
    roadLines.forEach((line, index) => {
        const newPos = (index * 33.3 + game.roadPosition) % 100;
        line.style.top = `${newPos}%`;
    });
    
    // Move obstacles down
    game.obstacles.forEach((obstacle, index) => {
        obstacle.top += GAME_SETTINGS.obstacleSpeed;
        obstacle.element.style.top = `${obstacle.top}px`;
        
        // Remove obstacles that are off-screen
        if (obstacle.top > gameArea.offsetHeight) {
            obstacle.element.remove();
            game.obstacles.splice(index, 1);
            
            // Increase score for avoiding obstacle
            addScore(10);
        }
    });
    
    // Move coins down
    game.coins.forEach((coin, index) => {
        coin.top += GAME_SETTINGS.obstacleSpeed;
        coin.element.style.top = `${coin.top}px`;
        
        // Remove coins that are off-screen
        if (coin.top > gameArea.offsetHeight) {
            coin.element.remove();
            game.coins.splice(index, 1);
        }
    });
}

// Check for collisions between player and obstacles/coins
function checkCollisions() {
    if (!game.isActive) return;
    
    const playerRect = playerCar.getBoundingClientRect();
    
    // Check obstacle collisions
    game.obstacles.forEach((obstacle, index) => {
        const obstacleRect = obstacle.element.getBoundingClientRect();
        
        if (isCollision(playerRect, obstacleRect)) {
            // Handle collision with obstacle
            handleCrash(obstacle);
            obstacle.element.remove();
            game.obstacles.splice(index, 1);
        }
    });
    
    // Check coin collisions
    game.coins.forEach((coin, index) => {
        const coinRect = coin.element.getBoundingClientRect();
        
        if (isCollision(playerRect, coinRect)) {
            // Handle collecting a coin
            collectCoin(coin);
            coin.element.remove();
            game.coins.splice(index, 1);
        }
    });
}

// Check if two rectangles collide
function isCollision(rect1, rect2) {
    return !(
        rect1.bottom < rect2.top + 10 || 
        rect1.top + 10 > rect2.bottom || 
        rect1.right < rect2.left + 10 || 
        rect1.left + 10 > rect2.right
    );
}

// Handle car crash
function handleCrash(obstacle) {
    // Create explosion effect
    const explosion = document.createElement('div');
    explosion.className = 'gta-explosion';
    explosion.style.left = `${game.playerPosition}%`;
    explosion.style.bottom = '50px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => {
        if (gameArea.contains(explosion)) {
            gameArea.removeChild(explosion);
        }
    }, 500);
    
    // Increase penalty based on obstacle type
    const penalty = obstacle.type === 'police' ? 2 : 1;
    
    // Reduce wanted stars
    game.stars = Math.max(0, game.stars - penalty);
    updateWantedStars();
    
    // End game if no stars left
    if (game.stars <= 0) {
        endGame();
    }
}

// Handle coin collection
function collectCoin(coin) {
    addScore(50);
    
    // Visual feedback
    const coinRect = coin.element.getBoundingClientRect();
    const scorePopup = document.createElement('div');
    scorePopup.textContent = '+50';
    scorePopup.style.position = 'absolute';
    scorePopup.style.left = `${coinRect.left}px`;
    scorePopup.style.top = `${coinRect.top}px`;
    scorePopup.style.color = '#ffd700';
    scorePopup.style.fontWeight = 'bold';
    scorePopup.style.zIndex = '20';
    scorePopup.style.animation = 'scorePopup 1s forwards';
    
    document.body.appendChild(scorePopup);
    
    setTimeout(() => {
        if (document.body.contains(scorePopup)) {
            document.body.removeChild(scorePopup);
        }
    }, 1000);
}

// Add score and update display
function addScore(points) {
    game.score += points;
    updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = game.score;
}

// Update wanted stars display
function updateWantedStars() {
    const stars = wantedDisplay.querySelectorAll('i');
    
    stars.forEach((star, index) => {
        if (index < game.stars) {
            star.classList.remove('inactive');
        } else {
            star.classList.add('inactive');
        }
    });
}

// Handle keyboard input
function handleKeyPress(e) {
    if (e.code === 'Space') {
        if (!game.isActive) {
            startGame();
        }
        e.preventDefault();
    }
    
    if (!game.isActive) return;
    
    if (e.code === 'ArrowLeft') {
        movePlayerCar('left');
        e.preventDefault();
    } else if (e.code === 'ArrowRight') {
        movePlayerCar('right');
        e.preventDefault();
    }
}

// Move the player's car
function movePlayerCar(direction) {
    if (direction === 'left') {
        game.playerPosition = Math.max(5, game.playerPosition - GAME_SETTINGS.carSpeed);
    } else if (direction === 'right') {
        game.playerPosition = Math.min(95, game.playerPosition + GAME_SETTINGS.carSpeed);
    }
    
    playerCar.style.left = `${game.playerPosition}%`;
}

// CSS Animation for score popup
function addScorePopupStyle() {
    if (!document.getElementById('score-popup-style')) {
        const style = document.createElement('style');
        style.id = 'score-popup-style';
        style.textContent = `
            @keyframes scorePopup {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-30px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGTAGame();
    addScorePopupStyle();
});

// © NaorNC - NCHub - All rights reserved - Discord.gg/NCHub
