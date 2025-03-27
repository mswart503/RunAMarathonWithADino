// Global Configuration and Game State – adjust these during development!
var GameConfig = {
    totalRounds: 10,
    // Define 10 rounds that scale from a short sprint to a full marathon.
    rounds: [100, 200, 500, 400, 600, 1000, 2000, 5000, 10000, 42195],
    baseTimePer100m: 5,      // seconds per 100m (e.g. 100m takes 5 sec)
    baseStaminaTime: 10,     // seconds for stamina to drop from full (no items)
    minDistance: 100,
    maxDistance: 42195,
    itemEffects: {
        Coin: { halfDuration: 3, cycle: 5 }, // active: half stamina usage for 3 sec every 5 sec
        Beehive: { reduction: 0.10 },               // 10% slower stamina depletion (passive)
        Target: { recover: 5, interval: 5 },          // recovers 5% stamina every 5 sec (cycles)
        Bomb: { cooldownReduction: 0.01 },    // reduces cooldowns by 1%
        Log: { staminaIncrease: 0.02, winBonus: 0.01 } // increases max stamina
    },
    // Descriptions for each item.
    itemDescriptions: {
        Coin: "Halves stamina usage for 3 sec every 5 sec.",
        Beehive: "Stamina depletes 10% slower.",
        Target: "Recovers 5% stamina every 5 sec.",
        Bomb: "Reduces item cooldowns by 1%.",
        Log: "Increases max stamina by 2% (plus bonus per win)."
    },
    // Sprite sheet coordinates for items.
    // These positions are 1-indexed (column, row) from your items sprite sheet.
    itemSpriteFrames: {
        Coin: { col: 10, row: 8 },
        Beehive: { col: 11, row: 8 },
        Target: { col: 12, row: 8 },
        Bomb: { col: 10, row: 9 },
        Log: { col: 11, row: 9 }
    },
    // Assuming the items sprite sheet has 16 columns.
    itemSpriteSheetColumns: 12
};

var GameState = {
    currentRound: 0,
    money: 0,
    equippedItems: [],  // the player's chosen items (up to 5)
    wins: 0,
    maxStamina: 100     // base max stamina; may be increased by Log
};

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
        
    }
    create() {
        // Add background image
        this.add.image(400, 300, 'background');
        
        this.add.text(200, 50, "Run A Marathon With A Dino", { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        this.add.text(200, 100, "Select your starting item", { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        
        // List the 5 available items.
        const items = Object.keys(GameConfig.itemEffects);
        let startY = 150;
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
            let cooldownBar = this.add.rectangle(x, iconY - iconSize/2 - 6, iconSize, 4, 0xff0000);
            // Save reference for update.
            this.itemDisplays.push({
                itemName: item,
                cooldownCycle: cooldownCycle,
                cooldownBar: cooldownBar,
                maxWidth: iconSize
            });
        });
        
        // Determine current race parameters.
        this.roundIndex = GameState.currentRound;
        this.distance = GameConfig.rounds[this.roundIndex];
        // Calculate the race’s duration based on distance (e.g. 100m = 5 sec).
        this.raceTime = (this.distance / 100) * GameConfig.baseTimePer100m;
        this.elapsedTime = 0;
        
        // Smooth scaling of the dino based on race distance.
        let dinoScale = Phaser.Math.Linear(1, 0.2, (this.distance - GameConfig.minDistance) / (GameConfig.maxDistance - GameConfig.minDistance));
        
        // Create the dino sprite from its sprite sheet.
        // The running animation uses the first 14 frames.
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('dino', { start: 0, end: 13 }),
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
        let progress = Phaser.Math.Clamp(this.elapsedTime / this.raceTime, 0, 1);
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
        //this.staminaBar.x = 400 - 150 + newWidth / 2;
        
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
            GameState.currentRound++;
            if (GameState.currentRound < GameConfig.totalRounds) {
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
        GameState.currentRound = 0;
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
    }
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
