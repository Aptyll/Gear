const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const TILE_SIZE = 50;
const PLAYER_SIZE = 40;
const GEAR_SIZE = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const COLORS = {
    darkSquare: '#1a1a1a',
    lightSquare: '#2a2a2a',
    player: '#4a9eff',
    common: '#FFFFFF',
    rare: '#9B30FF',
    legendary: '#FFB700'
};

// Set canvas size
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Player state
let player = {
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2,
    speed: 2,
    gear: {
        helmet: null,
        chest: null,
        legs: null,
        boots: null
    }
};

// Gear system
class GearPiece {
    constructor(slot, rarity) {
        this.slot = slot;
        this.rarity = rarity;
        this.color = COLORS[rarity];
        this.glowIntensity = 0.5;  
    }

    updateGlow() {
        this.glowIntensity = 0.5;
    }

    getGlowStyle() {
        return `0 0 10px ${this.color}`;
    }
}

// Draw checkered background
function drawBackground() {
    for (let row = 0; row < CANVAS_HEIGHT / TILE_SIZE; row++) {
        for (let col = 0; col < CANVAS_WIDTH / TILE_SIZE; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.darkSquare : COLORS.lightSquare;
            ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// Draw player and gear
function drawPlayer() {
    const centerX = player.x + PLAYER_SIZE / 2;
    const centerY = player.y + PLAYER_SIZE / 2;

    // Draw base player color
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Draw gear pieces with glow
    Object.entries(player.gear).forEach(([slot, gear]) => {
        if (gear) {
            // Set base color
            ctx.fillStyle = gear.color;
            
            // Add simple glow effect
            if (gear.rarity !== 'common') {
                ctx.shadowColor = gear.color;
                ctx.shadowBlur = 10;
            } else {
                ctx.shadowBlur = 0;
            }

            // Draw gear quadrants
            switch(slot) {
                case 'helmet':
                    ctx.fillRect(player.x, player.y, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'chest':
                    ctx.fillRect(centerX, player.y, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'legs':
                    ctx.fillRect(player.x, centerY, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'boots':
                    ctx.fillRect(centerX, centerY, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
            }
        }
    });

    // Reset shadow for other drawing
    ctx.shadowBlur = 0;

    // Draw dividing lines for visual clarity
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, player.y);
    ctx.lineTo(centerX, player.y + PLAYER_SIZE);
    ctx.moveTo(player.x, centerY);
    ctx.lineTo(player.x + PLAYER_SIZE, centerY);
    ctx.stroke();
}

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Update player position
function updatePlayer() {
    if (keys['a'] && player.x > 0) player.x -= player.speed;
    if (keys['d'] && player.x < CANVAS_WIDTH - PLAYER_SIZE) player.x += player.speed;
    if (keys['w'] && player.y > 0) player.y -= player.speed;
    if (keys['s'] && player.y < CANVAS_HEIGHT - PLAYER_SIZE) player.y += player.speed;
}

// Handle gear slot clicks
document.querySelectorAll('.gear-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        const slotType = slot.dataset.slot;
        const rarities = ['common', 'rare', 'legendary'];
        const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
        
        player.gear[slotType] = new GearPiece(slotType, randomRarity);
        
        // Update slot visual
        slot.style.borderColor = COLORS[randomRarity];
        slot.style.boxShadow = player.gear[slotType].getGlowStyle();
    });
});

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw game elements
    drawBackground();
    drawPlayer();
    
    // Update game state
    updatePlayer();
    
    // Update gear effects
    Object.values(player.gear).forEach(gear => {
        if (gear) gear.updateGlow();
    });
    
    // Update slot glow visuals
    document.querySelectorAll('.gear-slot').forEach(slot => {
        const slotType = slot.dataset.slot;
        const gear = player.gear[slotType];
        if (gear && gear.rarity !== 'common') {
            slot.style.boxShadow = gear.getGlowStyle();
        } else {
            slot.style.boxShadow = 'none';
        }
    });
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
