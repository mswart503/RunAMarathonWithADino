// Global Configuration and Game State – adjust these during development!
class EffectManager {
    constructor() {
        // Array to store active effects.
        this.effects = [];
    }

    /**
     * Adds a new effect.
     * @param {Object} effect - An object with properties:
     *   type: "stamina" or "speed" etc.
     *   value: multiplier (e.g., 0.5 means half usage, 1.1 means 10% increase)
     *   cycle: (optional) the full cycle time (in seconds)
     *   activeDuration: (optional) how long within the cycle the effect is active
     *   duration: (optional) total duration of effect (or Infinity for permanent)
     */
    addEffect(effect) {
        effect.elapsed = 0; // Initialize elapsed time.
        // If duration is not specified, assume effect lasts for the whole race.
        effect.duration = effect.duration || Infinity;
        this.effects.push(effect);
    }

    /**
     * Removes an effect. You might call this if an item is sold.
     * @param {Object} effectToRemove 
     */
    removeEffect(effectToRemove) {
        this.effects = this.effects.filter(eff => eff !== effectToRemove);
    }

    /**
     * Updates all effects by delta (in seconds) and removes expired ones.
     */
    update(delta) {
        this.effects = this.effects.filter(effect => {
            effect.elapsed += delta;
            // Remove if its duration has been exceeded.
            return (effect.elapsed < effect.duration);
        });
    }

    /**
     * Computes the net multiplier for a given type.
     * Effects with a cycle apply only during their active phase.
     * Effects stack multiplicatively.
     * @param {String} type - e.g., "stamina" or "speed"
     * @returns {Number} net multiplier
     */
    getNetMultiplier(type) {
        let multiplier = 1;
        this.effects.forEach(effect => {
            if (effect.type === type) {
                // If the effect has a cycle, check if it's active.
                if (effect.cycle && effect.activeDuration) {
                    let phase = effect.elapsed % effect.cycle;
                    if (phase < effect.activeDuration) {
                        multiplier *= effect.value;
                    }
                } else {
                    // Continuous effect.
                    multiplier *= effect.value;
                }
            }
        });
        return multiplier;
    }
}

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

    itemData: {
        Coin: { rarity: "Common", cycle: 3 },
        Bit: { rarity: "Common", cycle: 4 },
        Copper: { rarity: "Common", cycle: 5 },
        CopperStack: { rarity: "Common", cycle: 5 },
        Silver: { rarity: "Uncommon", cycle: 5 },
        Dubloon: { rarity: "Uncommon", cycle: 2 },
        Piece: { rarity: "Uncommon", cycle: 4 },
        Gold: { rarity: "Rare", cycle: 5 },
        Pound: { rarity: "Rare", cycle: 3 },
        Booty: { rarity: "Rare", cycle: 5 },


        Ruby_Amulet: { cycle: 5 }
    },

    rarityWeights: {
        Rare: 1,
        Uncommon: 5,
        Common: 10
    },

    rarityColors: {
        Common: "#0000FF",   // Blue
        Uncommon: "#FF0000", // Red
        Rare: "#FFD700"      // Gold
    },

    itemDescriptions: {
        Coin: "Halves stamina usage for 1 sec every 3 sec.",
        Bit: "Halves stamina usage for 1 sec every 4 sec.",
        Copper: "Halves stamina usage for 1 sec every 5 sec.",
        CopperStack: "Halves stamina usage for 2 sec every 5 sec.",
        Silver: "Halves stamina usage for 3 sec every 5 sec.",
        Dubloon: "Halves stamina usage for 1 sec every 2 sec.",
        Piece: "Halves stamina usage for 2 sec every 4 sec.",
        Gold: "Halves stamina usage for 4 sec every 5 sec.",
        Pound: "Halves stamina usage for 2 sec every 3 sec.",
        Booty: "Halves stamina usage for 3 sec every 4 sec.",

        Ginger: "Stamina depletes 10% slower.",
        Ruby_Amulet: "Recovers 5% stamina every 5 sec.",
        Ring: "Reduces item cooldowns by 1%.",
        Candle: "Increases max stamina by 2% (plus bonus per win)."
    },
    // Items sprite sheet now has 12 columns.
    itemSpriteSheetColumns: 64,
    itemSpriteFrames: {
        Coin: { col: 23, row: 9 },
        Bit: { col: 26, row: 9 },
        Copper: { col: 32, row: 9 },
        CopperStack: { col: 34, row: 9 },
        Silver: { col: 18, row: 9 },
        Dubloon: { col: 15, row: 9 },
        Piece: { col: 12, row: 9 },
        Gold: { col: 3, row: 9 },
        Pound: { col: 10, row: 9 },
        Booty: { col: 13, row: 9 },

        Ginger: { col: 1, row: 10 },
        Ruby_Amulet: { col: 1, row: 6 },
        Ring: { col: 1, row: 5 },
        Candle: { col: 1, row: 12 }
    },
    // Define fixed item purchase prices (hard-coded values between $3 and $7)
    itemPrices: {
        Coin: 1,
        Bit: 1,
        Copper: 1,
        CopperStack: 1,
        Silver: 2,
        Dubloon: 2,
        Piece: 2,
        Gold: 3,
        Pound: 3,
        Booty: 3,
        Ginger: 2,
        Ruby_Amulet: 2,
        Ring: 2,
        Candle: 2
    },
    consumableDescriptions: {
        apple: "5% stamina refill",
        Orange: "10% stamina refill",
        Beer: "20% stamina refill"
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
        this.load.spritesheet('bulkItems', 'Run A Marathon With A Dino/assets/bulkItems.png', { frameWidth: 16, frameHeight: 16, spacing: 0 })
    }
    create() {
        // Add background image
        this.add.image(400, 300, 'background');

        this.add.text(200, 150, "Run A Marathon With A Dino", { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        this.add.text(200, 200, "Select your starting item", { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        // Randomly pick 3 unique items from the available list.
        let allItems = Object.keys(GameConfig.itemData);
        Phaser.Utils.Array.Shuffle(allItems);
        let availableItems = allItems.slice(0, 5);
        // List the 5 available items.
        //const items = Object.keys(GameConfig.itemDescriptions);
        let startY = 250;
        availableItems.forEach(item => {
            // Create a container for the icon and the text.
            let container = this.add.container(200, startY);

            // Get the frame index from the sprite sheet using our mapping.
            let frameIndex = getItemFrameIndex(item);
            let icon = this.add.image(0, 0, 'bulkItems', frameIndex).setScale(2);
            let desc = GameConfig.itemDescriptions[item];
            let text = this.add.text(40, -8, `${item}: ${desc}`, { fontSize: '16px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
            container.add([icon, text]);

            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);
            container.on('pointerdown', () => {
                // Save the chosen item.
                GameState.equippedItems.push(item);
                // If Candle is chosen, update max stamina.
                if (item === "Candle") {
                    GameState.maxStamina = 100 * (1 + GameConfig.itemData.Candle.staminaIncrease);
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
        this.statusMenu = this.add.container(this.game.config.width - 160, this.game.config.height - 120);
        this.speedText = this.add.text(0, 0, "Speed: 0", { fontSize: '16px', fill: '#fff' });
        this.weightText = this.add.text(0, 20, "Weight: 100", { fontSize: '16px', fill: '#fff' });
        this.intoxText = this.add.text(0, 40, "Intox: 0%", { fontSize: '16px', fill: '#fff' });
        this.wellRestedText = this.add.text(0, 80, "Well Rested: 0%", { fontSize: '16px', fill: '#fff' });
        this.statusMenu.add([this.speedText, this.weightText, this.intoxText, this.wellRestedText]);
        // After creating the dino, for example:
        this.speedMultiplier = 1;  // default speed multiplier
        this.currentIntox = 0;     // current intoxication level (in %)
        this.currentWellRested = 0; // For testing, set to 50%

        // Cooldown bars for intoxication and well-rested (100 pixels wide)
        this.intoxBar = this.add.rectangle(0, 65, 100, 10, 0xff0000).setOrigin(0, 0.5);
        this.wellRestedBar = this.add.rectangle(0, 105, 100, 10, 0x00ff00).setOrigin(0, 0.5);
        this.statusMenu.add([this.intoxBar, this.wellRestedBar]);

        // Initialize intoxication and well-rested cooldown timers
        this.intoxCooldown = 0;
        this.wellRestedCooldown = 0;
        // Also, flags to indicate if an effect is active:
        this.isTripping = false;
        this.isBoosting = false;

        // Create an EffectManager instance.
        this.effectManager = new EffectManager();

        // Initialize base properties.
        this.speedMultiplier = 1;   // Base speed multiplier.
        // (Your stamina value is already set from GameState.maxStamina, etc.)

        // Add effects for each equipped item.
        GameState.equippedItems.forEach((item, index) => {
            if (item === "Coin") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 3,            // Every 3 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Bit") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 4 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Copper") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "CopperStack") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 2,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Silver") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 3,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Dubloon") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 2,            // Every 2 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Piece") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 4 seconds,
                    activeDuration: 2,   // active for 2 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Gold") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 4,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Pound") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 4 seconds,
                    activeDuration: 4,   // active for 2 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Booty") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 5 seconds,
                    activeDuration: 3,   // active for 1 seconds,
                    duration: Infinity   // lasting for the whole race
                });
            }
            // Similarly, if "Ginger" gives a permanent 10% reduction in depletion:
            if (item === "Ginger") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.9,          // 10% slower depletion (multiply by 0.9)
                    duration: Infinity
                });
            }
            // You can add additional items for speed, cooldown, etc.

            // Create a rectangle above the icon to display the cooldown progress.
            // We'll start with a full bar (width = iconSize) and a height of 4 pixels.
            let cooldownCycle = null;

            // If the item is "Coin" or "Ruby_Amulet", set cooldownCycle accordingly.
            if (item === "Coin") {
                cooldownCycle = GameConfig.itemData.Coin.cycle;
            }
            else if (item === "Bit") {
                cooldownCycle = GameConfig.itemData.Bit.cycle;
            }
            else if (item === "Copper") {
                cooldownCycle = GameConfig.itemData.Copper.cycle;
            } 
            else if (item === "CopperStack") {
                cooldownCycle = GameConfig.itemData.Copper.cycle;
            }else if (item === "Silver") {
                cooldownCycle = GameConfig.itemData.Silver.cycle;
            }
            else if (item === "Dubloon") {
                cooldownCycle = GameConfig.itemData.Dubloon.cycle;
            } 
            else if (item === "Piece") {
                cooldownCycle = GameConfig.itemData.Piece.cycle;
            }else if (item === "Gold") {
                cooldownCycle = GameConfig.itemData.Gold.cycle;
            }
            else if (item === "Pound") {
                cooldownCycle = GameConfig.itemData.Pound.cycle;
            } 
            else if (item === "Booty") {
                cooldownCycle = GameConfig.itemData.Booty.cycle;
            }
            
            else if (item === "Ruby_Amulet") {
                cooldownCycle = GameConfig.itemData.Ruby_Amulet.interval;
            }

            let frameIndex = getItemFrameIndex(item);
            let x = startX + index * (iconSize + spacing);
            let icon = this.add.image(x, iconY, 'bulkItems', frameIndex).setScale(iconScale);
            // Optional: add tooltip on hover.
            icon.setInteractive();
            icon.on('pointerover', () => {
                let tooltip = this.add.text(x, iconY - iconSize - 10, GameConfig.itemDescriptions[item], {
                    fontSize: '14px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5, 1);
                this.children.bringToTop(tooltip);
                icon.tooltip = tooltip;
            });
            icon.on('pointerout', () => {
                if (icon.tooltip) {
                    icon.tooltip.destroy();
                    icon.tooltip = null;
                }
            });
            // Create a rectangle above the icon to display the cooldown progress.
            let cooldownBar = this.add.rectangle(x, iconY - iconSize / 2 - 6, iconSize, 4, 0xff0000);
            // Save reference for update.
            this.itemDisplays.push({
                itemName: item,
                cooldownCycle: cooldownCycle,
                cooldownBar: cooldownBar,
                maxWidth: iconSize
            });
            icon.setInteractive();
            icon.on('pointerover', () => {
                // For example, position the tooltip just above the icon:
                let tooltipX = startX;
                let tooltipY = iconY + 20; // adjust this value as needed
                console.log("Tooltip should appear at:", tooltipX, tooltipY);

                let tooltip = this.add.text(tooltipX, tooltipY, GameConfig.itemDescriptions[item], {
                    fontSize: '14px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5, 1);
                this.children.bringToTop(tooltip);
                icon.tooltip = tooltip;
            });
            icon.on('pointerout', () => {
                if (icon.tooltip) {
                    icon.tooltip.destroy();
                    icon.tooltip = null;
                }
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
        //dinoScale *= (1 + (GameState.weight - 100) * 0.01);

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

        // Update our effect manager with delta.
        this.effectManager.update(delta);

        // Compute net multipliers from active effects.
        let staminaMultiplier = this.effectManager.getNetMultiplier("stamina");
        let speedMultiplier = this.effectManager.getNetMultiplier("speed");
        // If no speed effects are present, speedMultiplier remains 1.

        // Use the speedMultiplier when computing the effective elapsed time.
        let effectiveTime = this.elapsedTime * speedMultiplier;
        let startX = 50;
        let endX = 750;
        let progress = Phaser.Math.Clamp(effectiveTime / this.raceTime, 0, 1);
        this.dino.x = Phaser.Math.Interpolation.Linear([startX, endX], progress);

        // Use the staminaMultiplier for depletion.
        let depletionRate = GameState.maxStamina / GameConfig.baseStaminaTime;
        // For example, if multiplier is 0.5, stamina depletes at half the normal rate.
        this.stamina -= depletionRate * staminaMultiplier * delta;
        this.stamina = Phaser.Math.Clamp(this.stamina, 0, GameState.maxStamina);
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
        // If no effect is active, update the cooldown timers by delta (0.1 sec per tick)
        if (!this.isTripping && !this.isBoosting) {
            this.intoxCooldown += delta;
            this.wellRestedCooldown += delta;
        }

        // Check intoxication effect if its cooldown has reached 2 seconds
        if (!this.isTripping && !this.isBoosting && this.intoxCooldown >= 2) {
            let roll = Phaser.Math.Between(1, 100);
            // If the random roll is less than or equal to the current intoxication percentage, trigger trip effect
            if (roll <= this.currentIntox) {
                // Save current speed multiplier and trigger trip effect
                let originalSpeed = this.speedMultiplier;
                this.speedMultiplier = 0;  // dino stops
                this.dino.play('trip');      // play trip animation
                this.isTripping = true;
                // After 1 second, resume at half speed
                this.time.delayedCall(1000, () => {
                    this.speedMultiplier = originalSpeed * 0.5;
                    // Optionally revert animation back to run if needed:
                    this.dino.play('run');
                    // After 3 seconds, restore original speed and reset effect
                    this.time.delayedCall(3000, () => {
                        this.speedMultiplier = originalSpeed;
                        this.isTripping = false;
                        // Reset both cooldown timers
                        this.intoxCooldown = 0;
                        this.wellRestedCooldown = 0;
                    });
                });
            } else {
                // If no effect triggered, reset intoxCooldown
                this.intoxCooldown = 0;
            }
        }

        // Check well-rested effect if its cooldown has reached 2 seconds
        if (!this.isTripping && !this.isBoosting && this.wellRestedCooldown >= 2) {
            let roll = Phaser.Math.Between(1, 100);
            if (roll <= this.currentWellRested) {
                let originalSpeed = this.speedMultiplier;
                // Trigger boost: double the speed for 3 seconds.
                this.speedMultiplier = originalSpeed * 2;
                this.dino.play('dash');  // play dash animation
                this.isBoosting = true;
                this.time.delayedCall(3000, () => {
                    this.speedMultiplier = originalSpeed;
                    this.isBoosting = false;
                    // Reset both cooldown timers
                    this.intoxCooldown = 0;
                    this.wellRestedCooldown = 0;
                    this.dino.play('run'); // revert to running animation
                });
            } else {
                this.wellRestedCooldown = 0;
            }
        }

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
        this.scene.stop('RaceScene');

        // Add background image.
        this.add.image(400, 300, 'background');
        // --- Cash Display ---
        // Create a cash display box in the top right corner.
        this.cashText = this.add.text(this.game.config.width - 20, 20, `$${GameState.money}`, {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0);
        // Create a container for the inventory display (equipped items) at the top middle.
        this.inventoryContainer = this.add.container(0, 0);
        this.updateInventoryDisplay = () => {
            // Clear any existing icons.
            this.inventoryContainer.removeAll(true);

            let numItems = GameState.equippedItems.length;
            let iconScale = 2;
            let iconSize = 16 * iconScale;
            let spacing = 10;
            let totalWidth = numItems * iconSize + (numItems - 1) * spacing;
            let startX = (this.game.config.width - totalWidth) / 2 + iconSize / 2;
            let iconY = 30; // Y position for inventory icons.

            GameState.equippedItems.forEach((item, index) => {
                let frameIndex = getItemFrameIndex(item);
                let x = startX + index * (iconSize + spacing);
                let icon = this.add.image(x, iconY, 'bulkItems', frameIndex).setScale(iconScale);
                // Optional: add tooltip on hover.
                icon.setInteractive();
                icon.on('pointerover', () => {
                    let tooltip = this.add.text(x, iconY - iconSize - 10, GameConfig.itemDescriptions[item], {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5, 1);
                    this.children.bringToTop(tooltip);
                    icon.tooltip = tooltip;
                });
                icon.on('pointerout', () => {
                    if (icon.tooltip) {
                        icon.tooltip.destroy();
                        icon.tooltip = null;
                    }
                });
                this.inventoryContainer.add(icon);
            });
        };

        // Call this once initially.
        this.updateInventoryDisplay();

        this.add.text(300, 50, "Shop", { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        this.add.text(250, 100, "Select one item to add to your item slots", { fontSize: '20px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });

        // Randomly pick 3 unique items from the available list.
        let allItems = Object.keys(GameConfig.itemData);
        Phaser.Utils.Array.Shuffle(allItems);
        let availableItems = allItems.slice(0, 3);

        let startY = 150;
        availableItems.forEach(item => {
            // Create a container for the item icon, description, and price.
            let container = this.add.container(200, startY);

            let frameIndex = getItemFrameIndex(item);
            let icon = this.add.image(0, 0, 'bulkItems', frameIndex).setScale(2);
            let price = GameConfig.itemPrices[item];

            // Create price text to the left of the icon.
            let priceText = this.add.text(-50, 0, `$${price}`, {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 5, y: 2 }
            }).setOrigin(0.5);

            let descText = this.add.text(40, -8, `${item}: ${GameConfig.itemDescriptions[item]}`, {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)'
            });

            container.add([priceText, icon, descText]);
            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);

            container.on('pointerdown', () => {
                if (GameState.money >= price) {
                    // Deduct the price and update cash display.
                    GameState.money -= price;
                    this.cashText.setText(`$${GameState.money}`);

                    // Add the item if there's an available slot (max 5).
                    if (GameState.equippedItems.length < 5) {
                        GameState.equippedItems.push(item);
                        if (item === "Candle") {
                            GameState.maxStamina = 100 * (1 + GameConfig.itemData.Candle.staminaIncrease + GameState.wins * GameConfig.itemData.Candle.winBonus);
                        }
                    }

                    // Optionally, show a temporary "You Bought {item}" message.
                    let tipX = container.x + container.width / 2;
                    let tipY = container.y + 30;
                    let shoptip = this.add.text(tipX, tipY, `You Bought ${item}`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5);
                    this.time.delayedCall(1500, () => {
                        if (shoptip && shoptip.active) {
                            shoptip.destroy();
                        }
                    });

                    // Remove the store item from the display.
                    container.destroy();

                    // Refresh the inventory display to include the newly purchased item.
                    this.updateInventoryDisplay();

                } else {
                    console.log("Not enough cash to buy " + item);
                    let tipX = container.x + container.width / 2;
                    let tipY = container.y + 30;
                    let shoptip = this.add.text(tipX, tipY, `Not enough cash, stranger`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5);
                    this.time.delayedCall(1500, () => {
                        if (shoptip && shoptip.active) {
                            shoptip.destroy();
                        }
                    });
                }
            });
            let leaveShopButton = this.add.text(this.cameras.main.centerX, this.game.config.height - 50, "Leave Shop", {
                fontSize: '20px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setInteractive();

            leaveShopButton.on('pointerdown', () => {
                this.scene.start('RaceScene');
            });
            startY += 40;
        });
        // ----- Consumables Section -----
        let consStartY = startY + 40; // Use the current startY (from items) plus an offset

        // Add a header for the consumables section
        this.add.text(300, consStartY, "Consumables", {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)'
        }).setOrigin(0.5);
        consStartY += 40; // move down for listing consumables

        // Define available consumables
        let availableConsumables = ['apple', 'Orange', 'Beer'];
        // Define fixed prices for consumables if not already defined:
        GameConfig.consumablePrices = {
            apple: 1,
            Orange: 2,
            Beer: 3
        };

        availableConsumables.forEach(consumable => {
            // Create a container for each consumable option
            let container = this.add.container(200, consStartY);

            // Get the frame index from the consumable sprite sheet using your helper
            let frameIndex = getConsumableFrame(consumable);
            let icon = this.add.image(0, 0, 'consumableSprites', frameIndex).setScale(2);

            // Get the price for this consumable
            let price = GameConfig.consumablePrices[consumable];
            // Create price text to the left of the icon
            let priceText = this.add.text(-50, 0, `$${price}`, {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 5, y: 2 }
            }).setOrigin(0.5);

            // Create description text (here simply the consumable name)
            let descText = this.add.text(40, -8, `${consumable}: ${GameConfig.consumableDescriptions[consumable]}`, {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)'
            });
            container.add([priceText, icon, descText]);
            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);

            container.on('pointerdown', () => {
                if (GameState.money >= price) {
                    // Deduct the price and update cash display.
                    GameState.money -= price;
                    this.cashText.setText(`$${GameState.money}`);

                    // Add the consumable to the player's consumables inventory.
                    GameState.consumables.push(consumable);

                    // Optionally, show a temporary "You Bought {consumable}" message.
                    let tipX = container.x + container.width / 2;
                    let tipY = container.y + 30;
                    let shoptip = this.add.text(tipX, tipY, `You Bought ${consumable}`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5);
                    this.time.delayedCall(3000, () => {
                        if (shoptip && shoptip.active) {
                            shoptip.destroy();
                        }
                    });

                    // Remove this consumable option from the shop display.
                    container.destroy();
                } else {
                    console.log("Not enough cash to buy " + consumable);
                }
            });

            consStartY += 40; // Move down for the next consumable option.
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
                this.time.delayedCall(3000, () => {
                    if (tooltip && tooltip.active) {
                        tooltip.destroy();
                    }
                });
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
    switch (consumable) {
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

function getWeightedRandomItem() {
    // Create an array of items with weighted entries.
    let weightedItems = [];
    Object.keys(GameConfig.itemData).forEach(itemName => {
        let rarity = GameConfig.itemData[itemName].rarity;
        let weight = GameConfig.rarityWeights[rarity] || 1;
        for (let i = 0; i < weight; i++) {
            weightedItems.push(itemName);
        }
    });
    // Pick a random item from the weighted list.
    return Phaser.Utils.Array.GetRandom(weightedItems);
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
