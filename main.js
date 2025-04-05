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
        effect.lastCycleCount = 0;
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
    /**
 * Computes the total periodic addition for a given effect type.
 * Returns an object with:
 *   addition: the total amount to add,
 *   cycles: total number of cycles triggered.
 *
 * For example, for "staminaRecovery" effects:
 *   - effect.value is the fraction of max stamina to recover per cycle.
 *   - effect.cycle is the period in seconds.
 */
    getPeriodicAddition(types, maxValue, delta) {
        let addition = 0;
        let totalCycles = 0;
        this.effects.forEach(effect => {
            if (types.includes(effect.type) && effect.cycle) {
                let newCycleCount = Math.floor(effect.elapsed / effect.cycle);
                let cyclesPassed = newCycleCount - effect.lastCycleCount;
                if (cyclesPassed > 0) {
                    if (effect.type === "staminaRecovery") {
                        addition += cyclesPassed * effect.value * maxValue;
                    }
                    totalCycles += cyclesPassed;
                    effect.lastCycleCount = newCycleCount;
                }
            }
        });
        return { addition, cycles: totalCycles };
    }
}

const commonPrice = 2;
const uncommonPrice = 4;
const rarePrice = 6;
const elitePrice = 8;

var GameConfig = {
    totalRounds: 63,
    // Define 63 rounds that scale from a short sprint to a full marathon.
    rounds: [100, 200, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7000,
        10000, 13000, 17000, 21100, 23000, 25000, 27000, 29000, 32000, 33000, 
        35000, 37000, 39000, 42195],

    longRounds: [100, 200, 300, 400, 500, 700, 900, 1100, 1300, 1500, 1800, 2100, 2400, 2700, 3000,
        3400, 3800, 4200, 4600, 5000, 5500, 6000, 6500, 7000, 7500, 8100, 8700, 9300, 9900, 10500,
        11200, 11900, 12600, 13300, 14000, 14800, 15600, 16400, 17200, 18000, 18900, 19800, 20700,
        21600, 22500, 23500, 24500, 25500, 26500, 27500, 28600, 29700, 30800, 31900, 33000, 34200,
        35400, 36600, 37800, 39000, 40300, 41600, 42195],
    baseTimePer100m: 5,      // seconds per 100m remains unchanged
    baseStaminaTime: 10,
    minDistance: 100,
    maxDistance: 6300, // now maximum is level 63 (6300m)


    itemData: {
        //Flow state: Halve stamina usage
        Coin: { rarity: "Common", cycle: 3, 
            description: "Halves stamina usage for 1 sec every 3 sec.",
            image: { col: 23, row: 9 }, price: commonPrice},
        Bit: { rarity: "Common", cycle: 4, 
            description:"Halves stamina usage for 1 sec every 4 sec.",
            image: { col: 26, row: 9 }, price: commonPrice},
        Copper: { rarity: "Common", cycle: 5, 
            description: "Halves stamina usage for 1 sec every 5 sec.",
            image:{ col: 32, row: 9 }, price: commonPrice},
        CopperStack: { rarity: "Common", cycle: 5, 
            description: "Halves stamina usage for 2 sec every 5 sec.",
            image: { col: 34, row: 9 }, price: commonPrice},
        Silver: { rarity: "Uncommon", cycle: 5, 
            description: "Halves stamina usage for 3 sec every 5 sec.",
            image: { col: 18, row: 9 }, price: uncommonPrice},
        Dubloon: { rarity: "Uncommon", cycle: 2, 
            description: "Halves stamina usage for 1 sec every 2 sec.",
            image: { col: 15, row: 9 }, price: uncommonPrice},
        Piece: { rarity: "Uncommon", cycle: 4, 
            description: "Halves stamina usage for 2 sec every 4 sec.",
            image: { col: 12, row: 9 }, price: uncommonPrice},
        Gold: { rarity: "Rare", cycle: 5, 
            description: "Halves stamina usage for 4 sec every 5 sec.",
            image: { col: 3, row: 9 }, price: rarePrice},
        Pound: { rarity: "Rare", cycle: 3, 
            description: "Halves stamina usage for 2 sec every 3 sec.",
            image: { col: 10, row: 9 }, price: rarePrice},
        Booty: { rarity: "Rare", cycle: 5, 
            description: "Halves stamina usage for 3 sec every 4 sec.",
            image: { col: 13, row: 9 }, price: rarePrice},


        //Recovers stamina periodically
        RubyAmulet: { rarity: "Common", cycle: 5, 
            description: "Recovers 1% stamina every 5 sec.",
            image:{ col: 11, row: 6 }, price: commonPrice},
        SapphireAmulet: { rarity: "Common", cycle: 4, 
            description: "Recovers 1% stamina every 4 sec.",
            image:{ col: 12, row: 6 }, price: commonPrice},
        AmethystAmulet: { rarity: "Common", cycle: 3, 
            description: "Recovers 1% stamina every 3 sec.",
            image:{ col: 13, row: 6 }, price: commonPrice},
        EmeraldAmulet: { rarity: "Common", cycle: 2, 
            description: "Recovers 1% stamina every 2 sec.",
            image:{ col: 14, row: 6 }, price: commonPrice},
        BlessedRubyAmulet: { rarity: "Common", cycle: 5, 
            description: "Recovers 2% stamina every 5 sec.",
            image:{ col: 1, row: 6 }, price: commonPrice},
        BlessedSapphireAmulet: { rarity: "Common", cycle: 4, 
            description: "Recovers 2% stamina every 4 sec.",
            image:{ col: 2, row: 6 }, price: commonPrice},
        BlessedAmethystAmulet: { rarity: "Common", cycle: 3, 
            description: "Recovers 2% stamina every 3 sec.",
            image:{ col: 3, row: 6 }, price: commonPrice},
        BlessedEmeraldAmulet: { rarity: "Common", cycle: 5, 
            description: "Recovers 3% stamina every 5 sec.",
            image:{ col: 4, row: 6 }, price: commonPrice},
        PharaohsAmulet: { rarity: "Uncommon", cycle: 5, 
            description: "Recovers 4% stamina every 5 sec.",
            image: { col: 16, row: 6 }, price: uncommonPrice},
        DeceiversAmulet: { rarity: "Uncommon", cycle: 4, 
            description: "Recovers 3% stamina every 4 sec.",
            image:{ col: 18, row: 6 }, price: uncommonPrice},
        HolyAmulet: { rarity: "Uncommon", cycle: 5, 
            description: "Recovers 5% stamina every 5 sec.",
            image: { col: 22, row: 6 }, price: uncommonPrice},
        MessiahAmulet: { rarity: "Rare", cycle: 1, 
            description: "Recovers 1% stamina every 1 sec.",
            image:{ col: 30, row: 6 }, price: rarePrice},
        UnderworldAmulet: { rarity: "Rare", cycle: 2, 
            description: "Recovers 2% stamina every 2 sec.",
            image: { col: 21, row: 6 }, price: rarePrice},
        ShiningAmulet: { rarity: "Rare", cycle: 3, 
            description: "Recovers 3% stamina every 3 sec.",
            image:{ col: 20, row: 6 }, price: rarePrice},
        AmbixAmulet: { rarity: "Rare", cycle: 4, 
            description: "Recovers 4% stamina every 4 sec.",
            image:{ col: 31, row: 6 }, price: rarePrice},
    
            //Flat Speed Increase
        Shoes: { rarity: "Common", flatSpeedIncrease: 0.5, 
            description: "Increase Speed by 50%",
            image:{ col: 21, row: 31 }, price: commonPrice},
        CowboyBoots: { rarity: "Common", flatSpeedIncrease: 0.6, 
            description: "Increase Speed by 60%",
            image: { col: 22, row: 31 }, price: commonPrice},
        Galoshes: { rarity: "Common", flatSpeedIncrease: 0.7, 
            description: "Increase Speed by 70%",
            image: { col: 23, row: 31 }, price: commonPrice},
        Sneakers: { rarity: "Common", flatSpeedIncrease: 0.8, 
            description: "Increase Speed by 80%",
            image: { col: 24, row: 31 }, price: commonPrice},
        Nikes: { rarity: "Common", flatSpeedIncrease: 0.9, 
            description: "Increase Speed by 90%",
            image: { col: 24, row: 32 }, price: commonPrice},
        NiceShoes: { rarity: "Uncommon", flatSpeedIncrease: 1.0, 
            description: "Increase Speed by 100%",
            image: { col: 21, row: 32 }, price: uncommonPrice},
        SuedeCowboyBoots: { rarity: "Uncommon", flatSpeedIncrease: 1.1, 
            description: "Increase Speed by 110%",
            image: { col: 22, row: 32 }, price: uncommonPrice},
        ToughGaloshes: { rarity: "Uncommon", flatSpeedIncrease: 1.2,
             description: "Increase Speed by 120%",
             image: { col: 23, row: 32 }, price: uncommonPrice},
        Hokas: { rarity: "Rare", flatSpeedIncrease: 1.3, 
            description: "Increase Speed by 130%",
            image: { col: 24, row: 33 }, price: rarePrice},
        BestGaloshes: { rarity: "Rare", flatSpeedIncrease: 1.4, 
            description:"Increase Speed by 140%",
            image: { col: 23, row: 33 }, price: rarePrice},

        //Increase speed on each cooldown trigger:
        Cape: { rarity: "Uncommon", cooldownSpeedBonus: 0.05, 
            description: "Each cooldown trigger increases speed by 5%.",
            image: { col: 28, row: 18 }, price: rarePrice},
        BloodCape: { rarity: "Uncommon", cooldownSpeedBonus: 0.1, 
            description: "Each cooldown trigger increases speed by 10%.",
            image: { col: 28, row: 21 }, price: rarePrice},
        RegalCape: { rarity: "Rare", cooldownSpeedBonus: 0.15, 
            description: "Each cooldown trigger increases speed by 15%.",
            image: { col: 28, row: 22 }, price:elitePrice},
        DarkCape: { rarity: "Rare", cooldownSpeedBonus: 0.20, 
            description:"Each cooldown trigger increases speed by 20%.",
            image: { col: 28, row: 23 }, price:elitePrice},
 

    },

    rarityWeights: {
        Rare: 1,
        Uncommon: 40,
        Common: 100,
        Testing: 10000,

    },

    rarityColors: {
        Testing: "#000000",
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

        RubyAmulet: "Recovers 1% stamina every 5 sec.",
        SapphireAmulet: "Recovers 1% stamina every 4 sec.",
        AmethystAmulet: "Recovers 1% stamina every 3 sec.",
        EmeraldAmulet: "Recovers 1% stamina every 2 sec.",
        BlessedRubyAmulet: "Recovers 2% stamina every 5 sec.",
        BlessedSapphireAmulet: "Recovers 2% stamina every 4 sec.",
        BlessedAmethystAmulet: "Recovers 2% stamina every 3 sec.",
        BlessedEmeraldAmulet: "Recovers 3% stamina every 5 sec.",
        PharaohsAmulet: "Recovers 4% stamina every 5 sec.",
        DeceiversAmulet: "Recovers 3% stamina every 4 sec.",
        HolyAmulet: "Recovers 5% stamina every 5 sec.",
        MessiahAmulet: "Recovers 1% stamina every 1 sec.",
        UnderworldAmulet: "Recovers 2% stamina every 2 sec.",
        ShiningAmulet: "Recovers 3% stamina every 3 sec.",
        AmbixAmulet: "Recovers 4% stamina every 4 sec.",

        Shoes: "Increase Speed by 50%",
        CowboyBoots: "Increase Speed by 60%",
        Galoshes: "Increase Speed by 70%",
        Sneakers: "Increase Speed by 80%",
        Nikes: "Increase Speed by 90%",
        NiceShoes: "Increase Speed by 100%",
        SuedeCowboyBoots: "Increase Speed by 110%",
        ToughGaloshes: "Increase Speed by 120%",
        Hokas: "Increase Speed by 130%",
        BestGaloshes: "Increase Speed by 140%",

        Cape: "Each cooldown trigger increases speed by 5%.",
        BloodCape: "Each cooldown trigger increases speed by 10%.",
        RegalCape: "Each cooldown trigger increases speed by 15%.",
        DarkCape: "Each cooldown trigger increases speed by 20%.",
        //Ginger: "Stamina depletes 10% slower.",
        //Ring: "Reduces item cooldowns by 1%.",
        //Candle: "Increases max stamina by 2% (plus bonus per win)."
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

        RubyAmulet: { col: 11, row: 6 },
        SapphireAmulet: { col: 12, row: 6 },
        AmethystAmulet: { col: 13, row: 6 },
        EmeraldAmulet: { col: 14, row: 6 },
        BlessedRubyAmulet: { col: 1, row: 6 },
        BlessedSapphireAmulet: { col: 2, row: 6 },
        BlessedAmethystAmulet: { col: 3, row: 6 },
        BlessedEmeraldAmulet: { col: 4, row: 6 },
        PharaohsAmulet: { col: 16, row: 6 },
        DeceiversAmulet: { col: 18, row: 6 },
        HolyAmulet: { col: 22, row: 6 },
        MessiahAmulet: { col: 30, row: 6 },
        UnderworldAmulet: { col: 21, row: 6 },
        ShiningAmulet: { col: 20, row: 6 },
        AmbixAmulet: { col: 31, row: 6 },

        Shoes: { col: 21, row: 31 },
        CowboyBoots: { col: 22, row: 31 },
        Galoshes: { col: 23, row: 31 },
        Sneakers: { col: 24, row: 31 },
        Nikes: { col: 24, row: 32 },
        NiceShoes: { col: 21, row: 32 },
        SuedeCowboyBoots: { col: 22, row: 32 },
        ToughGaloshes: { col: 23, row: 32 },
        Hokas: { col: 24, row: 33 },
        BestGaloshes: { col: 23, row: 33 },

        Cape: { col: 28, row: 18 },
        BloodCape: { col: 28, row: 21 },
        RegalCape: { col: 28, row: 22 },
        DarkCape: { col: 28, row: 23 },
        //Ginger: { col: 1, row: 10 },
        //Ring: { col: 1, row: 5 },
        //Candle: { col: 1, row: 12 }
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
        RubyAmulet: 1,
        SapphireAmulet: 1,
        AmethystAmulet: 1,
        EmeraldAmulet: 1,
        BlessedRubyAmulet: 1,
        BlessedSapphireAmulet: 1,
        BlessedAmethystAmulet: 1,
        BlessedEmeraldAmulet: 1,
        PharaohsAmulet: 2,
        DeceiversAmulet: 2,
        HolyAmulet: 2,
        MessiahAmulet: 3,
        UnderworldAmulet: 3,
        ShiningAmulet: 3,
        AmbixAmulet: 3,
        Shoes: 1,
        CowboyBoots: 1,
        Galoshes: 1,
        Sneakers: 1,
        Nikes: 1,
        NiceShoes: 2,
        SuedeCowboyBoots: 2,
        ToughGaloshes: 2,
        Hokas: 3,
        BestGaloshes: 3,

        Cape: 4,
        BloodCape: 5,
        RegalCape: 6,
        DarkCape: 7,
        //Ginger: 2,
        //Ring: 2,
        //Candle: 2
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
    winCount: 0,
    maxStamina: 100,
    weight: 100,  // Starting weight
    // Add consumables array (you can pre-populate with sample names, e.g., "apple", "Pasta", etc.)
    consumables: [],
    maxItems: 5

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
        this.load.spritesheet('bulkItems', 'assets/bulkItems.png', { frameWidth: 16, frameHeight: 16, spacing: 0 })
        this.load.image('confetti', 'assets/confetti.png');

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
        let startY = 250;
        GameState.consumables = ['apple', 'Orange', 'Beer'];

        availableItems.forEach(item => {
            // Create a container for the icon and the text.
            let container = this.add.container(200, startY);

            // Get the frame index from the sprite sheet using our mapping.
            let frameIndex = getItemFrameIndex(item);
            let icon = this.add.image(0, 0, 'bulkItems', frameIndex).setScale(2);
            let desc = GameConfig.itemData[item].description;
            let text = this.add.text(40, -8, `${item}: ${desc}`, { fontSize: '16px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
            container.add([icon, text]);

            container.setSize(300, 20);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);
            container.on('pointerdown', () => {
                // Save the chosen item.
                GameState.equippedItems.push(item);

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
        GameState.newSlotButton = 20;
        this.cooldownBonus = 0; // This bonus will accumulate over the race.
        this.speedOverride = 1;
        this.currentSpeedMultiplier = 0; // start at a baseline multiplier

        // Create a display for equipped items (icons with cooldown bars) at the top middle.
        this.itemDisplays = [];
        let numItems = GameState.equippedItems.length;
        let iconScale = 2;
        let iconSize = 16 * iconScale;  // scaled width/height of item icons
        let spacing = 10;
        let totalWidth = numItems * iconSize + (numItems - 1) * spacing;
        let startX = (this.game.config.width - totalWidth) / 2 + iconSize / 2;
        let iconY = 30;
        // --- Timer ---
        this.timerText = this.add.text(300, 200, "Time: 0.0 sec", {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });


        // --- Status Menu ---
        this.statusMenu = this.add.container(this.game.config.width - 210, this.game.config.height - 140);
        this.currentSpeedText = this.add.text(0, 0, "Speed: 00.0 m/s", { fontSize: '16px', fill: '#fff' });
        this.speedText = this.add.text(0, 20, "Top Speed: 00.0 m/s", { fontSize: '16px', fill: '#fff' });
        this.weightText = this.add.text(0, 40, "Weight: 100", { fontSize: '16px', fill: '#fff' });
        this.intoxText = this.add.text(0, 60, "Intox: 0%", { fontSize: '16px', fill: '#fff' });
        this.wellRestedText = this.add.text(0, 100, "Well Rested: 0%", { fontSize: '16px', fill: '#fff' });
        this.statusMenu.add([this.currentSpeedText, this.speedText, this.weightText, this.intoxText, this.wellRestedText]);
        // After creating the dino, for example:
        this.speedMultiplier = 0;  // default speed multiplier
        this.currentIntox = 0;     // current intoxication level (in %)
        this.currentWellRested = 0; // For testing, set to 50%

        // Cooldown bars for intoxication and well-rested (100 pixels wide)
        this.intoxBar = this.add.rectangle(0, 85, 100, 10, 0xff0000).setOrigin(0, 0.5);
        this.wellRestedBar = this.add.rectangle(0, 125, 100, 10, 0x00ff00).setOrigin(0, 0.5);
        this.statusMenu.add([this.intoxBar, this.wellRestedBar]);

        // Initialize intoxication and well-rested cooldown timers
        this.intoxCooldown = 0;
        this.wellRestedCooldown = 0;
        // Also, flags to indicate if an effect is active:
        this.isTripping = false;
        this.isBoosting = false;

        // Create an EffectManager instance.
        this.effectManager = new EffectManager();


        // Add effects for each equipped item.
        GameState.equippedItems.forEach((item, index) => {
            if (item === "Coin") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 3,            // Every 3 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    lastCycleCount: 0,
                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Bit") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 4 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Copper") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "CopperStack") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 2,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Silver") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 3,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Dubloon") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 2,            // Every 2 seconds,
                    activeDuration: 1,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Piece") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 4 seconds,
                    activeDuration: 2,   // active for 2 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Gold") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 5 seconds,
                    activeDuration: 4,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Pound") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 5,            // Every 4 seconds,
                    activeDuration: 4,   // active for 2 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            if (item === "Booty") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.5,          // Half stamina usage
                    cycle: 4,            // Every 5 seconds,
                    activeDuration: 3,   // active for 1 seconds,
                    lastCycleCount: 0,

                    duration: Infinity   // lasting for the whole race
                });
            }
            // Similarly, if "Ginger" gives a permanent 10% reduction in depletion:
            /*if (item === "Ginger") {
                this.effectManager.addEffect({
                    type: "stamina",
                    value: 0.9,          // 10% slower depletion (multiply by 0.9)
                    duration: Infinity
                });
            }*/

            if (item === "RubyAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.01,       // 1% of max stamina per cycle
                    cycle: 5,          // every 5 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "SapphireAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.01,       // 1% of max stamina per cycle
                    cycle: 4,          // every 4 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "AmethystAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.01,       // 1% of max stamina per cycle
                    cycle: 3,          // every 3 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "EmeraldAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.01,       // 1% of max stamina per cycle
                    cycle: 2,          // every 2 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }

            if (item === "BlessedRubyAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.02,       // 2% of max stamina per cycle
                    cycle: 5,          // every 5 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "BlessedSapphireAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.02,       // 2% of max stamina per cycle
                    cycle: 4,          // every 4 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "BlessedAmethystAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.02,       // 2% of max stamina per cycle
                    cycle: 3,          // every 3 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "BlessedEmeraldAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.03,       // 3% of max stamina per cycle
                    cycle: 5,          // every 5 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }

            if (item === "PharaohsAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.04,       // 4% of max stamina per cycle
                    cycle: 5,          // every 5 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "DeceiversAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.03,       // 3% of max stamina per cycle
                    cycle: 4,          // every 4 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "HolyAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.05,       // 5% of max stamina per cycle
                    cycle: 5,          // every 3 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "MessiahAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.01,       // 1% of max stamina per cycle
                    cycle: 1,          // every 1 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "UnderworldAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.02,       // 2% of max stamina per cycle
                    cycle: 2,          // every 2 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "ShiningAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.03,       // 3% of max stamina per cycle
                    cycle: 3,          // every 3 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }
            if (item === "AmbixAmulet") {
                this.effectManager.addEffect({
                    type: "staminaRecovery",
                    value: 0.04,       // 4% of max stamina per cycle
                    cycle: 4,          // every 4 seconds
                    lastCycleCount: 0,

                    duration: Infinity // or a finite duration if needed
                });
            }



            // You can add additional items for speed, cooldown, etc.

            // Create a rectangle above the icon to display the cooldown progress.
            // We'll start with a full bar (width = iconSize) and a height of 4 pixels.
            let cooldownCycle = null;

            if (item === "Coin") {
                cooldownCycle = GameConfig.itemData.Coin.cycle;
            } else if (item === "Bit") {
                cooldownCycle = GameConfig.itemData.Bit.cycle;
            } else if (item === "Copper") {
                cooldownCycle = GameConfig.itemData.Copper.cycle;
            } else if (item === "CopperStack") {
                cooldownCycle = GameConfig.itemData.Copper.cycle;
            } else if (item === "Silver") {
                cooldownCycle = GameConfig.itemData.Silver.cycle;
            } else if (item === "Dubloon") {
                cooldownCycle = GameConfig.itemData.Dubloon.cycle;
            } else if (item === "Piece") {
                cooldownCycle = GameConfig.itemData.Piece.cycle;
            } else if (item === "Gold") {
                cooldownCycle = GameConfig.itemData.Gold.cycle;
            } else if (item === "Pound") {
                cooldownCycle = GameConfig.itemData.Pound.cycle;
            } else if (item === "Booty") {
                cooldownCycle = GameConfig.itemData.Booty.cycle;
            }

            else if (item === "RubyAmulet") {
                cooldownCycle = GameConfig.itemData.RubyAmulet.cycle;
            }
            else if (item === "SapphireAmulet") {
                cooldownCycle = GameConfig.itemData.SapphireAmulet.cycle;
            }
            else if (item === "AmethystAmulet") {
                cooldownCycle = GameConfig.itemData.AmethystAmulet.cycle;
            }
            else if (item === "EmeraldAmulet") {
                cooldownCycle = GameConfig.itemData.EmeraldAmulet.cycle;
            }
            else if (item === "BlessedRubyAmulet") {
                cooldownCycle = GameConfig.itemData.BlessedRubyAmulet.cycle;
            }
            else if (item === "BlessedSapphireAmulet") {
                cooldownCycle = GameConfig.itemData.BlessedSapphireAmulet.cycle;
            }
            else if (item === "BlessedAmethystAmulet") {
                cooldownCycle = GameConfig.itemData.BlessedAmethystAmulet.cycle;
            }
            else if (item === "BlessedEmeraldAmulet") {
                cooldownCycle = GameConfig.itemData.BlessedEmeraldAmulet.cycle;
            }
            else if (item === "PharaohsAmulet") {
                cooldownCycle = GameConfig.itemData.PharaohsAmulet.cycle;
            }
            else if (item === "DeceiversAmulet") {
                cooldownCycle = GameConfig.itemData.DeceiversAmulet.cycle;
            }
            else if (item === "HolyAmulet") {
                cooldownCycle = GameConfig.itemData.HolyAmulet.cycle;
            }
            else if (item === "MessiahAmulet") {
                cooldownCycle = GameConfig.itemData.MessiahAmulet.cycle;
            }
            else if (item === "UnderworldAmulet") {
                cooldownCycle = GameConfig.itemData.UnderworldAmulet.cycle;
            }
            else if (item === "ShiningAmulet") {
                cooldownCycle = GameConfig.itemData.ShiningAmulet.cycle;
            }
            else if (item === "AmbixAmulet") {
                cooldownCycle = GameConfig.itemData.AmbixAmulet.cycle;
            }


            let frameIndex = getItemFrameIndex(item);
            let x = startX + index * (iconSize + spacing);
            let icon = this.add.image(x, iconY, 'bulkItems', frameIndex).setScale(iconScale);
            // Optional: add tooltip on hover.
            icon.setInteractive();
            icon.on('pointerover', () => {
                let tooltip = this.add.text(x, iconY - iconSize + 75, `${item}:${GameConfig.itemData[item].description}`, {
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


        });

        // Determine current race parameters.
        this.roundIndex = GameState.currentLevel;
        this.distance = GameConfig.rounds[this.roundIndex];
        // Calculate the race’s duration based on distance (e.g. 100m = 5 sec).

        this.raceTime = (this.distance / 100) * (GameConfig.baseTimePer100m);
        this.elapsedTime = 0;

        // Smooth scaling of the dino based on race distance.
        let t = (this.distance - GameConfig.minDistance) / (GameConfig.maxDistance - GameConfig.minDistance);
        // Apply a power to slow growth (e.g., 0.5 makes it grow slower)
        t = Math.pow(t, 0.5);
        t = Phaser.Math.Clamp(t, 0, 1);
        let baseScale = Phaser.Math.Linear(1, 0.2, t);
        let dinoScale = baseScale * 4;
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
        this.staminaBar = this.add.rectangle(250, 580, 300, 20, 0x24DBAB);
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

        // ----- Fast Forward Controls -----
        this.fastForward = 1;  // Reset fast forward multiplier to 1 at the start of each race

        // Create a label for the fast forward section in the bottom left.
        let ffLabel = this.add.text(20, this.game.config.height - 80, "Fast Forward:", {
            fontSize: '18px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 5, y: 5 }
        });

        // Create a minus button. It will lower the multiplier but not below 1.
        let minusButton = this.add.text(20, this.game.config.height - 50, "–", {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 5, y: 5 }
        }).setInteractive();

        // Create a plus button. It will raise the multiplier up to 20.
        let plusButton = this.add.text(60, this.game.config.height - 50, "+", {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 5, y: 5 }
        }).setInteractive();

        // Create a display for the current fast forward value.
        let ffDisplay = this.add.text(110, this.game.config.height - 50, this.fastForward.toFixed(1), {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 5, y: 5 }
        });

        // When the minus button is clicked, decrease the multiplier (not below 1).
        minusButton.on('pointerdown', () => {
            if (this.fastForward > 1) {
                this.fastForward = Math.max(1, this.fastForward - 3);
                ffDisplay.setText(this.fastForward.toFixed(1));
            }
        });

        // When the plus button is clicked, increase the multiplier (up to 20).
        plusButton.on('pointerdown', () => {
            if (this.fastForward < 20) {
                this.fastForward = Math.min(20, this.fastForward + 3);
                ffDisplay.setText(this.fastForward.toFixed(1));
            }
        });

    }

    updateRace() {
        let baseDelta = 0.1; // each tick represents 0.1 seconds
        let delta = baseDelta * this.fastForward;
        this.elapsedTime += delta;



        // Update our effect manager with delta.
        this.effectManager.update(delta);

        // Compute net multipliers from active effects.
        let staminaMultiplier = this.effectManager.getNetMultiplier("stamina");
        let speedMultiplier = this.effectManager.getNetMultiplier("speed");
        // If no speed effects are present, speedMultiplier remains 1.

        // Apply periodic stamina recovery.
        let recoveryObj = this.effectManager.getPeriodicAddition(["staminaRecovery", "stamina"], GameState.maxStamina, delta);
        this.stamina = Math.min(this.stamina + recoveryObj.addition, GameState.maxStamina);

        // If any recovery cycles triggered, also trigger the bonus.
        if (recoveryObj.cycles > 0) {
            this.triggerCooldownBonus(recoveryObj.cycles);
        }
        // Sum flat speed bonuses from equipped items.

        let flatBonus = 0;
        GameState.equippedItems.forEach(item => {
            let data = GameConfig.itemData[item];
            if (data && data.flatSpeedIncrease) {
                flatBonus += data.flatSpeedIncrease;
            }
        });

        // Combine base speed multiplier and flat bonus.
        let finalSpeedMultiplier = speedMultiplier * (1 + flatBonus + this.cooldownBonus) * this.speedOverride;
        // Choose an acceleration factor (per second); adjust as needed.
        let accelerationFactor = 0.5; // This means 50% of the difference is closed per second.

        // Gradually update the current speed multiplier toward finalSpeedMultiplier.
        this.currentSpeedMultiplier = Phaser.Math.Linear(
            this.currentSpeedMultiplier,
            finalSpeedMultiplier,
            accelerationFactor * delta
        );

        // Use the speedMultiplier when computing the effective elapsed time.
        let effectiveTime = this.elapsedTime * this.currentSpeedMultiplier;
        //console.log(effectiveTime)
        let currentSpeedText = (GameConfig.baseTimePer100m * 4) * this.currentSpeedMultiplier;
        let speedText = (GameConfig.baseTimePer100m * 4) * finalSpeedMultiplier;
        this.currentSpeedText.setText(`Speed: ${currentSpeedText.toFixed(2)} m/s`);
        this.speedText.setText(`Top Speed: ${speedText.toFixed(2)} m/s`);

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

        // Determine stamina bar color.
        let staminaBarColor = 0x24DBAB; // default green
        this.effectManager.effects.forEach(effect => {
            if (effect.type === "stamina" && effect.cycle && effect.activeDuration) {
                let phase = effect.elapsed % effect.cycle;
                if (phase < effect.activeDuration) {
                    staminaBarColor = 0x2454DB; // blue when active
                }
            }
        });
        this.staminaBar.fillColor = staminaBarColor;

        this.staminaBar.width = newWidth;
        this.staminaText.setText(`${Math.floor(this.stamina)}/${GameState.maxStamina} (${Math.floor((this.stamina / GameState.maxStamina) * 100)}%)`);
        this.timerText.setText("Time: " + this.elapsedTime.toFixed(1) + " sec");

        // Update cooldown bars for equipped items.
        this.itemDisplays.forEach(display => {
            if (display.cooldownCycle) {
                // Calculate progress (from 0 when just used to full when recharged).
                let progress = (this.elapsedTime % display.cooldownCycle) / display.cooldownCycle;
                display.cooldownBar.width = progress * display.maxWidth;
                // Center the bar on the icon.
                //display.cooldownBar.x = display.cooldownBar.x = display.cooldownBar.x = display.cooldownBar.x; // (left as computed from initial x)
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
            if (roll <= this.currentIntox) {
                let originalOverride = this.speedOverride;
                this.speedOverride = 0;  // Stop dino
                this.dino.play('trip');
                this.isTripping = true;
                this.triggerCooldownBonus(); // Make sure to call it as a function!
                this.time.delayedCall(1000, () => {
                    this.speedOverride = originalOverride * 0.5;
                    this.dino.play('run');
                    this.time.delayedCall(3000, () => {
                        this.speedOverride = originalOverride;
                        this.isTripping = false;
                        this.intoxCooldown = 0;
                        this.wellRestedCooldown = 0;
                    });
                });
            } else {
                this.intoxCooldown = 0;
            }
        }


        // Check well-rested effect if its cooldown has reached 2 seconds
        if (!this.isTripping && !this.isBoosting && this.wellRestedCooldown >= 2) {
            let roll = Phaser.Math.Between(1, 100);
            if (roll <= this.currentWellRested) {
                let originalSpeed = this.finalSpeedMultiplier;
                // Trigger boost: double the speed for 3 seconds.
                finalSpeedMultiplier = originalSpeed * 2;
                this.dino.play('dash');  // play dash animation
                this.isBoosting = true;
                this.triggerCooldownBonus();

                this.time.delayedCall(3000, () => {
                    this.finalSpeedMultiplier = originalSpeed;
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

    triggerCooldownBonus(cycles) {
        let bonusFromItems = 0;
        GameState.equippedItems.forEach(item => {
            let data = GameConfig.itemData[item];
            if (data && data.cooldownSpeedBonus) {
                bonusFromItems += data.cooldownSpeedBonus;
            }
        });
        if (bonusFromItems > 0) {
            this.cooldownBonus += bonusFromItems * cycles;
            console.log("Cooldown bonus added: " + bonusFromItems + ". Total bonus: " + this.cooldownBonus);
        }
    }

    raceComplete() {
        // Calculate the completion time in seconds (formatted with 1 decimal).

        let completionTime = this.elapsedTime.toFixed(1);

        // Determine reward based on remaining stamina percentage.
        let reward;
        let percentLeft = (this.stamina / GameState.maxStamina) * 100;
        // If 75% or more stamina remains, reward $5; if between 50% and 75%, $3; otherwise, $1.
        if (percentLeft >= 75) {
            reward = 5;
        } else if (percentLeft >= 50) {
            reward = 4;
        } else if (percentLeft >= 25) {
            reward = 3;
        } else {
            reward = 2;
        }
        GameState.money += reward;
        GameState.winCount += 1;

        // Determine intensity: for example, base intensity of 5, plus 3 additional particles per win.
        let intensity = 5 + (GameState.winCount * 3);
        // Trigger the confetti effect.
        this.createConfetti(intensity);

        let summaryText = `Race Complete!\nStamina left: ${Math.floor(percentLeft)}%\nYou earned $${reward}\nTime: ${completionTime} sec`;
        this.add.text(300, 200, summaryText, { fontSize: '20px', fill: '#fff', backgroundColor: '#000' });

        // After a short delay, proceed to the Shop scene (or end game if rounds are finished).
        this.time.delayedCall(2000, () => {
            GameState.currentLevel++;
            if (GameState.currentLevel < GameConfig.totalRounds) {
                this.scene.start('ShopScene');
            } else {
                // Pass the final time to the next scene via the registry.
                this.registry.set("finalTime", completionTime);
                // Transition to the win screen.
                this.scene.start('WinScreenScene');
            }
        });
    }
    createConfetti(intensity) {
        // Create a Particle Emitter Manager for confetti.
        let particles = this.add.particles('confetti');

        let emitter = particles.createEmitter({
            x: { min: 0, max: this.game.config.width },
            y: 0,
            speedY: { min: 200, max: 400 },
            speedX: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            lifespan: { min: 1000, max: 2000 },
            gravityY: 300,
            quantity: intensity,  // More intensity means more particles.
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        // Let the emitter emit for a short time then stop and destroy.
        this.time.delayedCall(5000, () => {
            emitter.stop();
            // Optionally, destroy the particle manager after a delay.
            this.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });
    }


    raceLost() {
        // Display a loss message then reset the game state and return to Main Menu.
        this.add.text(300, 200, "You ran out of stamina!\nReturning to Main Menu...", { fontSize: '20px', fill: '#fff', backgroundColor: '#000' });
        // Reset game progress.
        GameState.currentLevel = 0;
        GameState.money = 0;
        GameState.winCount = 0;
        GameState.equippedItems = [];
        GameState.maxStamina = 100;
        GameState.newSlotPrice = 20;

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
        // At the beginning of ShopScene.create(), reset reroll price:
        this.rerollPrice = 2;
        if (GameState.newSlotPrice === undefined) {
            GameState.newSlotPrice = 20;
        }

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
            if (!this.inventoryContainer) {
                this.inventoryContainer = this.add.container(0, 0);
            } else {
                this.inventoryContainer.removeAll(true); // remove and destroy all children
            }

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

                icon.setInteractive();
                icon.on('pointerover', () => {
                    let tooltip = this.add.text(x, iconY - iconSize + 75, `${item}:${GameConfig.itemData[item].description}`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5, 1);
                    this.children.bringToTop(tooltip);
                    icon.tooltip = tooltip;
                });
                /*icon.on('pointerout', () => {
                    if (icon.tooltip) {
                        icon.tooltip.destroy();
                        icon.tooltip = null;
                    }
                });*/


                // NEW: Add pointerdown event to prompt selling the item.
                icon.on('pointerdown', () => {

                    icon.tooltipPersistent = true;

                    // Destroy any previous tooltips on this icon.
                    if (icon.tooltip) {
                        icon.tooltip.destroy();
                        icon.tooltip = null;
                    }
                    if (icon.sellTooltip) {
                        icon.sellTooltip.destroy();
                        icon.sellTooltip = null;
                    }

                    // Calculate the sell value: half the purchase price, rounded down (minimum $1).
                    let purchasePrice = GameConfig.itemData[item].price;
                    let sellValue = Math.max(Math.floor(purchasePrice / 2), 1);

                    let tooltip = this.add.text(x, iconY - iconSize + 75, `${item}:${GameConfig.itemData[item].description}`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5, 1);
                    this.children.bringToTop(tooltip);
                    icon.tooltip = tooltip;
                    // Create a tooltip for selling just below the icon.
                    let sellTooltip = this.add.text(x, iconY + iconSize + 10, `Sell ${item} for $${sellValue}?`, {
                        fontSize: '14px',
                        fill: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5, 0);
                    this.children.bringToTop(sellTooltip);
                    sellTooltip.setInteractive();
                    icon.sellTooltip = sellTooltip;

                    // When the tooltip is clicked, process the sale.
                    sellTooltip.on('pointerdown', () => {
                        // Add the sell value to the player's cash.
                        GameState.money += sellValue;
                        this.cashText.setText(`$${GameState.money}`);

                        // Remove the item from the equipped items.
                        Phaser.Utils.Array.Remove(GameState.equippedItems, item);

                        // Destroy the tooltip.
                        sellTooltip.destroy();
                        tooltip.destroy();
                        icon.sellTooltip = null;
                        icon.tooltip = null;
                        icon.tooltipPersistent = false;
                        // Refresh the inventory display.
                        this.updateInventoryDisplay();
                    });

                    // Optional: Remove the sell tooltip automatically after 3 seconds if not clicked.
                    this.time.delayedCall(3000, () => {
                        if (icon.sellTooltip) {
                            sellTooltip.destroy();
                            icon.sellTooltip = null;
                        }
                        if (icon.tooltip) {
                            tooltip.destroy();
                            icon.tooltip = null;
                        }
                        icon.tooltipPersistent = false;
                    });
                });
                icon.on('pointerout', () => {
                    if (!icon.tooltipPersistent && icon.tooltip) {
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
        this.add.text(50, 100, "Click an item to buy it, click an item in your inventory to sell it", { fontSize: '18px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' });
        let rerollCheck = false;


        // Helper function to display shop items.
        this.displayShopItems = () => {
            // If the container exists, destroy it.
            if (this.itemContainer) {
                this.itemContainer.destroy(true);
            }
            // Create a container for shop items.
            this.itemContainer = this.add.container(0, 150);

            // Get all items from your configuration, but filter out those already in the player's inventory.
            let allItems = Object.keys(GameConfig.itemData).filter(item => {
                return !GameState.equippedItems.includes(item);
            });
            Phaser.Utils.Array.Shuffle(allItems);

            // Pick the first 3 items.
            let availableItems = allItems.slice(0, 3);
            // Starting Y position for each shop item within the container.
            let startY = 0;
            availableItems.forEach(item => {
                // Create a container for each item (icon, price, and description).
                let container = this.add.container(200, startY);

                // Get the sprite frame.
                let frameIndex = getItemFrameIndex(item);
                let icon = this.add.image(0, 0, 'bulkItems', frameIndex).setScale(2);
                let price = GameConfig.itemData[item].price;
                // Create price text to the left of the icon.
                let priceText = this.add.text(-50, 0, `$${price}`, {
                    fontSize: '16px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 2 }
                }).setOrigin(0.5);
                // Create description text.
                let descText = this.add.text(40, -8, `${item}: ${GameConfig.itemData[item].description}`, {
                    fontSize: '16px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)'
                });

                container.add([priceText, icon, descText]);
                container.setSize(300, 20);
                container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 20), Phaser.Geom.Rectangle.Contains);

                // Purchase logic for the item.
                container.on('pointerdown', () => {

                    if (GameState.money >= price) {
                        console.log(GameState.maxItems)
                        if (GameState.equippedItems.length < GameState.maxItems) {
                            GameState.money -= price;
                            this.cashText.setText(`$${GameState.money}`);


                            GameState.equippedItems.push(item);
                            this.updateInventoryDisplay();

                            // If needed, update other properties (e.g., max stamina for "Log").
                            if (item === "Log") {
                                GameState.maxStamina = 100 * (1 + GameConfig.itemData.Log.staminaIncrease + GameState.winCount * GameConfig.itemData.Log.winBonus);
                            }


                            // Optionally, show a temporary confirmation message.
                            let tipX = container.x + container.width / 2;
                            let tipY = container.y + 150;
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

                            // Remove the purchased item from the shop display.
                            container.destroy();
                            // Refresh the shop items display.
                            //this.displayShopItems();
                        } else {
                            let tipX = container.x + container.width / 2;
                            let tipY = container.y + 150;
                            let shoptip = this.add.text(tipX, tipY, `Not enough space, stranger`, {
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
                    } else {
                        let tipX = container.x + container.width / 2;
                        let tipY = container.y + 150;
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


                startY += 40;
                this.itemContainer.add(container);
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
        };

        this.displayShopItems();

        // Create a Reroll button in the bottom left of the shop section.
        this.rerollButton = this.add.text(20, 150, "Reroll \n ($" + this.rerollPrice + ")", {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        this.rerollButton.on('pointerdown', () => {
            if (GameState.money >= this.rerollPrice) {
                GameState.money -= this.rerollPrice;
                this.cashText.setText(`$${GameState.money}`);
                // Increase the reroll price by $1.
                this.rerollPrice += 1;
                // Update the reroll button text.
                this.rerollButton.setText("Reroll \n ($" + this.rerollPrice + ")");

                // Re-display shop items.
                this.displayShopItems();
            } else {
                let tipX = this.rerollButton.x + 50 + this.rerollButton.width / 2;
                let tipY = this.rerollButton.y + 60;
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

        // ----- New: Buy New Item Slot Button -----
        this.newSlotButton = this.add.text(
            20,
            this.rerollButton.y + this.rerollButton.height + 10,
            "Buy New \nItem Slot \n ($" + GameState.newSlotPrice + ")", {
            fontSize: '15px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        this.newSlotButton.on('pointerdown', () => {
            if (GameState.money >= GameState.newSlotPrice) {
                // Deduct cash and update display.
                GameState.money -= GameState.newSlotPrice;
                this.cashText.setText(`$${GameState.money}`);
                // Increase available item slots.
                GameState.maxItems += 1;
                GameState.newSlotPrice += 20;
                this.newSlotButton.setText("Buy New \nItem Slot \n ($" + GameState.newSlotPrice + ")");
                // Show a confirmation tip.
                let tip = this.add.text(
                    this.newSlotButton.x + this.newSlotButton.width,
                    this.newSlotButton.y - 20,
                    "Item slot purchased!", {
                    fontSize: '16px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5);
                this.time.delayedCall(2000, () => {
                    tip.destroy();
                });
            } else {
                let tip = this.add.text(
                    this.newSlotButton.x + this.newSlotButton.width,
                    this.newSlotButton.y + 20,
                    "Not enough cash, stranger", {
                    fontSize: '16px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5);
                this.time.delayedCall(2000, () => {
                    tip.destroy();
                });
            }
        });

        // ----- Consumables Section -----
        if (this.consumableContainer) {
            this.consumableContainer.destroy(true);
        }
        this.consumableContainer = this.add.container(0, 250); // Position below the item container

        // Define header Y and initial start for items
        let headerY = this.consumableContainer.y + 40;
        this.add.text(300, headerY, "Consumables", {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)'
        }).setOrigin(0.5);
        let consStartY = headerY - 200;

        // Define available consumables
        let availableConsumables = ['apple', 'Orange', 'Beer'];
        // Define fixed prices for consumables:
        GameConfig.consumablePrices = {
            apple: 1,
            Orange: 2,
            Beer: 3
        };
        // And define descriptions (if not defined already)
        GameConfig.consumableDescriptions = {
            apple: "5% stamina refill",
            Orange: "10% stamina refill",
            Beer: "20% stamina refill"
        };

        availableConsumables.forEach(consumable => {
            console.log("Adding consumable: " + consumable + " at y=" + consStartY);
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

            // Create description text (using the description from GameConfig)
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

                    // Optionally, show a temporary confirmation message.
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
                    let tipX = container.x + container.width / 2;
                    let tipY = container.y + 250;
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

            consStartY += 40; // Move down for the next consumable option.
            this.consumableContainer.add(container);
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


class WinScreenScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScreenScene' });
    }

    create() {
        // Optional: Add a background image.
        this.add.image(400, 300, 'background');

        // Retrieve stats you want to show.
        // You could store these in GameState or pass via the scene's registry.
        // Here we'll assume final race time was stored in a variable before transitioning.
        let finalTime = this.registry.get("finalTime") || "N/A";
        let finalMoney = GameState.money;
        let totalWins = GameState.winCount;

        // Build a stats message.
        let statsText = `Congratulations!\nYou completed the final race!\n\nStats:\nTime: ${finalTime} sec\nMoney: $${finalMoney}\nwinCount: ${totalWins}`;

        // Display the stats in the center of the screen.
        this.add.text(400, 200, statsText, {
            fontSize: '24px',
            fill: '#fff',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        // Create a "New Run" button.
        let newRunButton = this.add.text(400, 400, "New Run", {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        newRunButton.on('pointerdown', () => {
            // Reset any necessary game state for a new run.
            GameState.currentLevel = 0;
            GameState.money = 0;
            GameState.winCount = 0;
            // Also, reset any temporary variables you need to restart (like newSlotPrice, etc.)
            GameState.newSlotPrice = 20;
            // Optionally, reset other persistent stats.
            // Transition to the ShopScene (or your starting scene for a new run).
            this.scene.start('MainMenuScene');
        });
    }
}

function getConsumableFrame(consumable) {
    // Map consumable names to frame indexes.
    const mapping = {
        Apple: 0,
        Orange: 1,
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
    let pos = GameConfig.itemData[itemName].image;
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
    scene: [MainMenuScene, RaceScene, ShopScene, WinScreenScene]
};

var game = new Phaser.Game(phaserConfig);
