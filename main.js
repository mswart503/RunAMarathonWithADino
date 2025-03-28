// Global Configuration and Game State – adjust these during development!
var GameConfig = {
    totalRounds: 63,
    // Define 63 rounds that scale from a short sprint to a full marathon.
    rounds: [100, 200, 300, 400, 500, 700, 900, 1100, 1300, 1500, 1800, 2100, 2400, 2700, 3000,
        3400, 3800, 4200, 4600, 5000, 5500, 6000, 6500, 7000, 7500, 8100, 8700, 9300, 9900, 10500,
        11200, 11900, 12600, 13300, 14000, 14800, 15600, 16400, 17200, 18000, 18900, 19800, 20700,
        21600, 22500, 23500, 24500, 25500, 26500, 27500, 28600, 29700, 30800, 31900, 33000, 34200,
        35400, 36600, 37800, 39000, 40300, 41600, 42195],
    baseTimePer100m: 5,      // seconds per 100m remains unchanged
    baseStaminaTime: 10,
    minDistance: 100,
    maxDistance: 6300, // now maximum is level 63 (6300m)
    // --- Item effects renamed ---
    itemEffects: {
        Coin: { halfDuration: 3, cycle: 5 },   // was "Feather"
        Beehive: { reduction: 0.10 },             // was "Item2"
        Target: { recover: 5, interval: 5 },       // was "Item3"
        Bomb: { cooldownReduction: 0.01 },       // was "Item4"
        Log: { staminaIncrease: 0.02, winBonus: 0.01 } // was "Item5"
    },
    itemDescriptions: {
        Coin: "Halves stamina usage for 3 sec every 5 sec.",
        Beehive: "Stamina depletes 10% slower.",
        Target: "Recovers 5% stamina every 5 sec.",
        Bomb: "Reduces item cooldowns by 1%.",
        Log: "Increases max stamina by 2% (plus bonus per win)."
    },
    // Items sprite sheet now has 12 columns.
    itemSpriteSheetColumns: 12,
    itemSpriteFrames: {
        Coin: { col: 10, row: 8 },
        Beehive: { col: 11, row: 8 },
        Target: { col: 12, row: 8 },
        Bomb: { col: 10, row: 9 },
        Log: { col: 11, row: 9 }
    },
    // Define fixed item purchase prices (hard-coded values between $3 and $7)
    itemPrices: {
        Coin: 5,
        Beehive: 4,
        Target: 6,
        Bomb: 3,
        Log: 7
    }
};

var GameState = {
    currentLevel: 0,
    money: 0,
    bonds: 0,  // For investment: each bond adds $1 per race
    equippedItems: [],  // Max 5 item slots
    wins: 0,
    maxStamina: 100,
    weight: 100,  // Starting weight
    // Add consumables array (you can pre-populate with sample names, e.g., "apple", "Pasta", etc.)
    consumables: []
};
GameState.consumables = ['apple', 'Orange', 'Beer'];

//
// MAIN MENU SCENE – lets the player choose one starting item
//
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    preload() {
        // Load shared assets for all scenes.
        this.load.spritesheet('dino', 'assets/dino.png', { frameWidth: 24, frameHeight: 24 });
        this.load.image('background', 'assets/background.png');
        this.load.image('flag', 'assets/flag.png');
        this.load.spritesheet('items', 'assets/items.png', { frameWidth: 16, frameHeight: 16, spacing: 1 });
        this.load.spritesheet('consumableSprites', 'assets/consumableSprites.png', { frameWidth: 16, frameHeight: 16, spacing: 0 });

    }
    create() {
        // Add background image
        this.add.image(400, 300, 'background');

        this.add.text(200, 150, "Run A Marathon With A Dino", { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        this.add.text(200, 200, "Select your starting item", { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });

        // List the 5 available items.
        const items = Object.keys(GameConfig.itemEffects);
        let startY = 250;
        items.forEach(item => {
            // Create a container for the icon and the text.
            let container = this.add.container(200, startY);

            // Get the frame index from the sprite sheet using our mapping.
            let frameIndex = getItemFrameIndex(item);
            let icon = this.add.image(0, 0, 'items', frameIndex).setScale(2);
            let desc = GameConfig.itemDescriptions[item];
            let text = this.add.text(40, -8, `${item}: ${desc}`, { fontSize: '16px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
            container.add([icon, text]);

            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);
            container.on('pointerdown', () => {
                // Save the chosen item.
                GameState.equippedItems.push(item);
                // If Log is chosen, update max stamina.
                if (item === "Log") {
                    GameState.maxStamina = 100 * (1 + GameConfig.itemEffects.Log.staminaIncrease);
                }
                this.scene.start('RaceScene');
            });

            startY += 40;
        });
    }
}

//
// RACE SCENE – simulates a race based on the current round, updates the dino’s position and stamina, and displays equipped items with cooldown bars
//
class RaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RaceScene' });
    }
    create() {
        // Add background image.
        this.add.image(400, 300, 'background');

        // Create a display for equipped items (icons with cooldown bars) at the top middle.
        this.itemDisplays = [];
        let numItems = GameState.equippedItems.length;
        let iconScale = 2;
        let iconSize = 16 * iconScale;  // scaled width/height of item icons
        let spacing = 10;
        let totalWidth = numItems * iconSize + (numItems - 1) * spacing;
        let startX = (this.game.config.width - totalWidth) / 2 + iconSize / 2;
        let iconY = 30;
        // --- Status Menu ---
        this.statusMenu = this.add.container(400, 40);
        this.speedText = this.add.text(0, 0, "Speed: 0", { fontSize: '16px', fill: '#fff' });
        this.weightText = this.add.text(0, 20, "Weight: 100", { fontSize: '16px', fill: '#fff' });
        this.intoxText = this.add.text(0, 40, "Intox: 0%", { fontSize: '16px', fill: '#fff' });
        this.wellRestedText = this.add.text(0, 60, "Well Rested: 0%", { fontSize: '16px', fill: '#fff' });
        this.statusMenu.add([this.speedText, this.weightText, this.intoxText, this.wellRestedText]);
        // After creating the dino, for example:
        this.speedMultiplier = 1;  // default speed multiplier
        this.currentIntox = 0;     // current intoxication level (in %)

        // Cooldown bars for intoxication and well-rested (100 pixels wide)
        this.intoxBar = this.add.rectangle(100, 40, 100, 10, 0xff0000).setOrigin(0, 0.5);
        this.wellRestedBar = this.add.rectangle(100, 60, 100, 10, 0x00ff00).setOrigin(0, 0.5);
        this.statusMenu.add([this.intoxBar, this.wellRestedBar]);

        // Initialize intoxication and well-rested cooldown timers
        this.intoxCooldown = 0;
        this.wellRestedCooldown = 0;
        // Also, flags to indicate if an effect is active:
        this.isTripping = false;
        this.isBoosting = false;

        GameState.equippedItems.forEach((item, index) => {
            // Compute frame index for the item icon.
            let frameIndex = getItemFrameIndex(item);
            let x = startX + index * (iconSize + spacing);
            let icon = this.add.image(x, iconY, 'items', frameIndex).setScale(iconScale);
            // For items with a cooldown, set the cycle time; for passive items, leave null.
            let cooldownCycle = null;
            if (item === "Coin") {
                cooldownCycle = GameConfig.itemEffects.Coin.cycle;
            } else if (item === "Target") {
                cooldownCycle = GameConfig.itemEffects.Target.interval;
            }
            // Create a rectangle above the icon to display the cooldown progress.
            // We'll start with a full bar (width = iconSize) and a height of 4 pixels.
            let cooldownBar = this.add.rectangle(x, iconY - iconSize / 2 - 6, iconSize, 4, 0xff0000);
            // Save reference for update.
            this.itemDisplays.push({
                itemName: item,
                cooldownCycle: cooldownCycle,
                cooldownBar: cooldownBar,
                maxWidth: iconSize
            });

        });

        // Determine current race parameters.
        this.roundIndex = GameState.currentLevel;
        this.distance = GameConfig.rounds[this.roundIndex];
        // Calculate the race’s duration based on distance (e.g. 100m = 5 sec).
        this.raceTime = (this.distance / 100) * GameConfig.baseTimePer100m;
        this.elapsedTime = 0;

        // Smooth scaling of the dino based on race distance.
        let baseScale = Phaser.Math.Linear(1, 0.2, (this.distance - GameConfig.minDistance) / (GameConfig.maxDistance - GameConfig.minDistance));
        let dinoScale = baseScale * 3;  // Starting scale is doubled.
        // Create the dino sprite from its sprite sheet.
        // The running animation uses the first 14 frames.
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('dino', { start: 5, end: 10 }),
            frameRate: 10,
            repeat: -1
        });
        this.dino = this.add.sprite(50, 330, 'dino').setScale(dinoScale);
        this.dino.play('run');

        // Place the checkered flag image at the finish line.
        this.flag = this.add.image(750, 330, 'flag');

        // Create a stamina bar.
        // Background bar.
        this.staminaBarBg = this.add.rectangle(400, 580, 300, 20, 0x555555);
        // Green bar showing current stamina.
        this.staminaBar = this.add.rectangle(250, 580, 300, 20, 0x00ff00);
        this.staminaBar.setOrigin(0, 0.5)
        this.staminaText = this.add.text(250, 580, "", { fontSize: '14px', fill: '#fff' }).setOrigin(0, 0.5);

        // --- Consumables Panel at Bottom ---
this.consumablesPanel = this.add.container(0, this.game.config.height - 50);
let comspacing = 40;

GameState.consumables.forEach((consumable, index) => {
    let iconX = startX + index * comspacing;
    let icon = this.add.image(iconX, 0, 'consumableSprites', getConsumableFrame(consumable)).setScale(2);
    icon.setInteractive();
    icon.on('pointerdown', () => {
        let worldX = icon.x + this.consumablesPanel.x;
        let worldY = icon.y + this.consumablesPanel.y;
        let tooltip = this.add.text(worldX, worldY - 30, `Eat ${consumable}?`, {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5);
        // Bring the tooltip to the top so it’s not hidden by other objects:
        this.children.bringToTop(tooltip);
        tooltip.setInteractive();
        tooltip.on('pointerdown', () => {
            applyConsumableEffect(consumable, this);
            Phaser.Utils.Array.Remove(GameState.consumables, consumable);
            tooltip.destroy();
            icon.destroy();
        });
        this.time.delayedCall(3000, () => {
            if (tooltip && tooltip.active) {
                tooltip.destroy();
            }
        });
    });
    
    this.consumablesPanel.add(icon);
});
    
        // Initialize stamina (using current max stamina).
        this.stamina = GameState.maxStamina;

        // Display current race distance.
        this.distanceText = this.add.text(10, 10, `Distance: ${this.distance}m`, { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });

        // Set up a timer event to update the race simulation every 100ms.
        this.timerEvent = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: this.updateRace,
            callbackScope: this
        });
    }

    updateRace() {
        let delta = 0.1; // each tick represents 0.1 seconds
        this.elapsedTime += delta;

        // Update dino’s horizontal position from start (50) to finish (750).
        let startX = 50;
        let endX = 750;
        let effectiveTime = this.elapsedTime * this.speedMultiplier;
        let progress = Phaser.Math.Clamp(effectiveTime / this.raceTime, 0, 1);
        this.dino.x = Phaser.Math.Interpolation.Linear([startX, endX], progress);

        // Calculate effective stamina depletion multiplier based on equipped items.
        let multiplier = 1;
        if (GameState.equippedItems.includes("Beehive")) {
            multiplier *= (1 - GameConfig.itemEffects.Beehive.reduction);
        }
        // Coin: every cycle, half stamina usage for the first few seconds.
        if (GameState.equippedItems.includes("Coin")) {
            let cycle = GameConfig.itemEffects.Coin.cycle;
            if (GameState.equippedItems.includes("Bomb")) {
                cycle = cycle * (1 - GameConfig.itemEffects.Bomb.cooldownReduction);
            }
            let phase = this.elapsedTime % cycle;
            if (phase < GameConfig.itemEffects.Coin.halfDuration) {
                multiplier *= 0.5;
            }
        }

        // Deplete stamina linearly over base time (modified by multiplier).
        let depletionRate = GameState.maxStamina / GameConfig.baseStaminaTime;
        this.stamina -= depletionRate * multiplier * delta;

        // Target: every interval, recover a bit of stamina.
        if (GameState.equippedItems.includes("Target")) {
            let TargetInterval = GameConfig.itemEffects.Target.interval;
            if (GameState.equippedItems.includes("Bomb")) {
                TargetInterval = TargetInterval * (1 - GameConfig.itemEffects.Bomb.cooldownReduction);
            }
            // When elapsedTime is nearly a multiple of the interval, add recovery.
            if (Math.abs(this.elapsedTime % TargetInterval) < delta) {
                this.stamina += GameConfig.itemEffects.Target.recover;
            }
        }

        // Clamp stamina between 0 and max.
        this.stamina = Phaser.Math.Clamp(this.stamina, 0, GameState.maxStamina);

        // Update the stamina bar’s width (300 pixels represents full stamina).
        let newWidth = (this.stamina / GameState.maxStamina) * 300;
        this.staminaBar.width = newWidth;
        this.staminaText.setText(`${Math.floor(this.stamina)}/${GameState.maxStamina} (${Math.floor((this.stamina / GameState.maxStamina) * 100)}%)`);

        // Update cooldown bars for equipped items.
        this.itemDisplays.forEach(display => {
            if (display.cooldownCycle) {
                // Calculate progress (from 0 when just used to full when recharged).
                let progress = (this.elapsedTime % display.cooldownCycle) / display.cooldownCycle;
                display.cooldownBar.width = progress * display.maxWidth;
                // Center the bar on the icon.
                display.cooldownBar.x = display.cooldownBar.x = display.cooldownBar.x = display.cooldownBar.x; // (left as computed from initial x)
            } else {
                // For passive items, keep the bar full.
                display.cooldownBar.width = display.maxWidth;
            }
        });

        // Check win/loss conditions.
        if (progress >= 1) {
            this.timerEvent.remove();
            this.raceComplete();
        } else if (this.stamina <= 0) {
            this.timerEvent.remove();
            this.raceLost();
        }
    }

    raceComplete() {
        // Determine reward based on remaining stamina percentage.
        let reward;
        let percentLeft = (this.stamina / GameState.maxStamina) * 100;
        // If 75% or more stamina remains, reward $5; if between 50% and 75%, $3; otherwise, $1.
        if (percentLeft >= 75) {
            reward = 5;
        } else if (percentLeft >= 50) {
            reward = 3;
        } else {
            reward = 1;
        }
        GameState.money += reward;
        GameState.wins += 1;

        let summaryText = `Race Complete!\nStamina left: ${Math.floor(percentLeft)}%\nYou earned $${reward}`;
        this.add.text(300, 200, summaryText, { fontSize: '20px', fill: '#fff', backgroundColor: '#000' });

        // After a short delay, proceed to the Shop scene (or end game if rounds are finished).
        this.time.delayedCall(2000, () => {
            GameState.currentLevel++;
            if (GameState.currentLevel < GameConfig.totalRounds) {
                this.scene.start('ShopScene');
            } else {
                // End of game; restart at Main Menu (you can later add a final summary).
                this.scene.start('MainMenuScene');
            }
        });
    }

    raceLost() {
        // Display a loss message then reset the game state and return to Main Menu.
        this.add.text(300, 200, "You ran out of stamina!\nReturning to Main Menu...", { fontSize: '20px', fill: '#fff', backgroundColor: '#000' });
        // Reset game progress.
        GameState.currentLevel = 0;
        GameState.money = 0;
        GameState.wins = 0;
        GameState.equippedItems = [];
        GameState.maxStamina = 100;
        this.time.delayedCall(2000, () => {
            this.scene.start('MainMenuScene');
        });
    }
}

//
// SHOP SCENE – lets the player pick one new item (from a unique set of 3 out of 5) to add to their slots.
// Each item is displayed with its icon and description.
//
class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }
    create() {
        // Add background image.
        this.add.image(400, 300, 'background');

        this.add.text(300, 50, "Shop", { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        this.add.text(250, 100, "Select one item to add to your item slots", { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });

        // Randomly pick 3 unique items from the available list.
        let allItems = Object.keys(GameConfig.itemEffects);
        Phaser.Utils.Array.Shuffle(allItems);
        let availableItems = allItems.slice(0, 3);

        let startY = 150;
        availableItems.forEach(item => {
            // Create a container for icon and text.
            let container = this.add.container(200, startY);
            let frameIndex = getItemFrameIndex(item);
            let icon = this.add.image(0, 0, 'items', frameIndex).setScale(2);
            let desc = GameConfig.itemDescriptions[item];
            let text = this.add.text(40, -8, `${item}: ${desc}`, { fontSize: '16px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
            container.add([icon, text]);

            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);
            container.on('pointerdown', () => {
                if (GameState.equippedItems.length < 5) {
                    GameState.equippedItems.push(item);
                    // If Log is purchased, update max stamina accordingly.
                    if (item === "Log") {
                        GameState.maxStamina = 100 * (1 + GameConfig.itemEffects.Log.staminaIncrease + GameState.wins * GameConfig.itemEffects.Log.winBonus);
                    }
                }
                this.scene.start('RaceScene');
            });



            startY += 40;
        });
        // --- Consumables Panel at Bottom ---
        this.consumablesPanel = this.add.container(0, this.game.config.height - 50);  // Position 50 pixels from the bottom
        let startX = 20; // Starting X position for the first consumable icon
        let spacing = 40; // Horizontal spacing between icons

        // Loop through each consumable in GameState.consumables
        GameState.consumables.forEach((consumable, index) => {
            // Calculate the X position for this icon.
            let iconX = startX + index * spacing;

            // Create the icon using the 'consumableSprites' key and the frame from our helper.
            let icon = this.add.image(iconX, 0, 'consumableSprites', getConsumableFrame(consumable)).setScale(2);

            // Make the icon interactive so it can respond to clicks.
            icon.setInteractive();

            // When the icon is clicked, show a tooltip with an "Eat" button.
            icon.on('pointerdown', () => {
                // Get world coordinates for the icon:
                let worldX = icon.x + this.consumablesPanel.x;
                let worldY = icon.y + this.consumablesPanel.y;
                // Create tooltip in world space:
                let tooltip = this.add.text(worldX, worldY - 30, `Eat ${consumable}?`, {
                    fontSize: '14px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5);
                
                tooltip.setInteractive();
                tooltip.on('pointerdown', () => {
                    applyConsumableEffect(consumable, this);
                    Phaser.Utils.Array.Remove(GameState.consumables, consumable);
                    tooltip.destroy();
                    icon.destroy();
                });

                // Optionally, you can set a timeout to remove the tooltip if the player doesn’t click it.
                //this.time.delayedCall(3000, () => {
                //if (tooltip && tooltip.active) {
                //    tooltip.destroy();
                //  }
                //});
            });

            // Add this icon to the consumables panel container.
            this.consumablesPanel.add(icon);
        });

    }
}
function getConsumableFrame(consumable) {
    // Map consumable names to frame indexes.
    const mapping = {
        apple: 0,
        Orange: 1,
        Banana: 2,
        Pasta: 3,
        Sandwich: 4,
        Beer: 5,
        // Add more consumables as needed.
    };
    // Return the mapped frame index, defaulting to 0 if not found.
    return mapping[consumable] !== undefined ? mapping[consumable] : 0;
}

//
// Utility function to compute the frame index for an item icon.
// Given the item name, use the configured column and row (assumed 1-indexed) and the known number of columns.
function getItemFrameIndex(itemName) {
    let pos = GameConfig.itemSpriteFrames[itemName];
    if (!pos) return 0;
    // Convert 1-indexed (col, row) to a 0-indexed frame number.
    let col = pos.col - 1;
    let row = pos.row - 1;
    return row * GameConfig.itemSpriteSheetColumns + col;
}
function applyConsumableEffect(consumable, scene) {
    switch(consumable) {
        case 'apple':
            // Restore 1% of max stamina.
            // scene.stamina is the current stamina and GameState.maxStamina is the maximum.
            scene.stamina = Math.min(scene.stamina + GameState.maxStamina * 0.05, GameState.maxStamina);
            console.log("Apple eaten: Stamina restored by 5%.");
            break;
        case 'Orange':
            // Create a speed boost for 5 seconds.
            // Increase the speedMultiplier by 20% (i.e. multiply by 1.2).
            scene.stamina = Math.min(scene.stamina + GameState.maxStamina * 0.10, GameState.maxStamina);
            console.log("Orange eaten: Stamina restored by 10%.");
            break;
            
            
            
            //Speed enhancement code. Doens't work right now. Will return to.
           // let originalSpeed = scene.speedMultiplier;
            //scene.speedMultiplier = originalSpeed * 1.2;
            //console.log("Orange eaten: Speed boosted by 20% for 5 seconds.");
            // After 5 seconds, reset the speed multiplier.
            //scene.time.delayedCall(5000, () => {
            //    scene.speedMultiplier = originalSpeed;
            //    console.log("Orange effect ended: Speed multiplier reset.");
            //});
            //break;
        case 'Beer':
            // Restore 20% of max stamina.
            scene.stamina = Math.min(scene.stamina + GameState.maxStamina * 0.20, GameState.maxStamina);
            // Increase intoxication by 5%.
            scene.currentIntox += 5;
            // Increase weight by 1 (permanent effect).
            GameState.weight += 1;
            console.log("Beer consumed: 20% stamina restored, intoxication +5%, weight +1.");
            break;
        default:
            console.log(`No effect defined for ${consumable}.`);
    }
}


//
// GAME INITIALIZATION
//
var phaserConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainMenuScene, RaceScene, ShopScene]
};

var game = new Phaser.Game(phaserConfig);
