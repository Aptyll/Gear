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
        shoulder: null,
        leg: null,
        boot: null
    }
};

// Gear system
class GearPiece {
    constructor(slot, rarity) {
        this.slot = slot;
        this.rarity = rarity;
        this.color = COLORS[rarity];
        this.glowIntensity = 0;
        this.glowIncreasing = true;
    }

    updateGlow() {
        if (this.rarity === 'legendary') {
            if (this.glowIncreasing) {
                this.glowIntensity += 0.05;
                if (this.glowIntensity >= 1) {
                    this.glowIntensity = 1;
                    this.glowIncreasing = false;
                }
            } else {
                this.glowIntensity -= 0.05;
                if (this.glowIntensity <= 0.3) {
                    this.glowIntensity = 0.3;
                    this.glowIncreasing = true;
                }
            }
        }
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
    // Draw base player
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Calculate center point for dividing the square
    const centerX = player.x + PLAYER_SIZE / 2;
    const centerY = player.y + PLAYER_SIZE / 2;

    // Draw equipped gear as quadrants
    Object.entries(player.gear).forEach(([slot, gear]) => {
        if (gear) {
            // Set up glow effect for legendary items
            if (gear.rarity === 'legendary') {
                ctx.shadowColor = gear.color;
                ctx.shadowBlur = 10 + (gear.glowIntensity * 5);
            }

            ctx.fillStyle = gear.color;
            
            // Draw gear as quadrants based on slot
            switch(slot) {
                case 'helmet':
                    // Top-left quadrant
                    ctx.fillRect(player.x, player.y, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'shoulder':
                    // Top-right quadrant
                    ctx.fillRect(centerX, player.y, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'leg':
                    // Bottom-left quadrant
                    ctx.fillRect(player.x, centerY, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
                case 'boot':
                    // Bottom-right quadrant
                    ctx.fillRect(centerX, centerY, PLAYER_SIZE/2, PLAYER_SIZE/2);
                    break;
            }
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    });

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
        if (randomRarity === 'legendary') {
            slot.style.boxShadow = `0 0 10px ${COLORS[randomRarity]}`;
        } else {
            slot.style.boxShadow = 'none';
        }
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
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
