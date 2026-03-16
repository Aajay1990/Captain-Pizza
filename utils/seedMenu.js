import MenuItem from '../models/MenuItem.js';

const menuData = {
    pizzas: [
        {
            category: "Simple Veg",
            items: [
                { name: "Margherita", desc: "Pizza sauce & cheese", image: "MERGHERITA.png", price: { small: 110, medium: 210, large: 340 } },
                { name: "Onion & Jalapeno", desc: "Pizza sauce, jalapeno & cheese", image: "ONION& JALAPENO.png", price: { small: 110, medium: 210, large: 340 } },
                { name: "Sweet Corn", desc: "Pizza sauce, sweet corn & cheese", image: "SWEET CORN.png", price: { small: 110, medium: 210, large: 340 } },
                { name: "Paneer & Onion", desc: "Paneer, Onion & cheese", image: "Paneer & Onion.png", price: { small: 110, medium: 210, large: 340 } },
                { name: "Tomato & Capsicum", desc: "Capsicum, Tomato & cheese", image: "TOMATO & CAPSICUM.png", price: { small: 110, medium: 210, large: 340 } },
                { name: "2 In 1 Veg. Pizza", desc: "Pizza sauce, Onion, Tomato & cheese", image: "2 IN 1 PIZZA.png", price: { small: 110, medium: 210, large: 340 } },
            ]
        },
        {
            category: "Classic Veg",
            items: [
                { name: "Mix Masti Veg", desc: "Onion, Jalapeno, Tomato & cheese", image: "MIX MASTI VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Golden Lover", desc: "Onion, Capsicum, Mushroom & cheese", image: "GOLDEN LOVER .png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Mexican Special", desc: "Onion, Capsicum, Tomato & cheese", image: "MAXICAN SPECIAL.png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Spicy Veg", desc: "Onion, Capsicum, Green chillies & cheese", image: "SPICY VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Golden Corn Veg", desc: "Corn, Capsicum, Tomato & cheese", image: "GOLDEN CORN VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Farm House", desc: "Onion, Capsicum, Tomato, Mushroom & cheese", image: "FARM HOUSE.png", price: { small: 140, medium: 280, large: 410 } },
                { name: "Spl. Double Chees Margerita", desc: "Pizza sauce & Double cheese", image: "SPL. DOUBLE CHEES MARGERITA.png", price: { small: 140, medium: 280, large: 410 } },
            ]
        },
        {
            category: "Deluxe Veg",
            items: [
                { name: "Spl. Makhani Paneer", desc: "Makhani sauce, Onion, Paneer & Cheese", image: "SPL. MAKHANI PANEER.png", price: { small: 180, medium: 360, large: 520 } },
                { name: "Spl. Punjabi Paneer Masti", desc: "Onion, Capsicum, Red Chilli Peppers, Paneer & cheese", image: "SPL. PUNJABI PANEER MASTI.png", price: { small: 180, medium: 360, large: 520 } },
                { name: "Spl. Deluxe Mix Paneer", desc: "Tandoori Sauce, Paneer, Capsicum, Red Chilli Peppers, Onion & cheese", image: "SPL. DELUXE VEG.png", price: { small: 180, medium: 360, large: 520 } },
                { name: "Spl. Spicy Peppy Paneer", desc: "Spicy Sauce, Onion, Capsicum, Paneer, Red Chili Peppers & cheese", image: "SPL. SPICY PEPPY PANEER.png", price: { small: 180, medium: 360, large: 520 } },
                { name: "Spl. Deluxe Veg", desc: "Onion, Capsicum, Mushroom, Paneer, Corn & cheese", image: "SPL. DELUXE VEG.png", price: { small: 180, medium: 360, large: 520 } },
                { name: "Golden Paradise", desc: "Corn, Jalapeno, Red Chilli Peppers & Cheese", image: "GOLDEN PARADISE.png", price: { small: 180, medium: 360, large: 520 } },
            ]
        },
        {
            category: "Supreme Veg",
            items: [
                { name: "Extravaganza Veg", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Olives & Cheese", image: "EXTRAVAGANZA VEG.png", price: { small: 220, medium: 440, large: 650 } },
                { name: "Spicy Wonder", desc: "Spicy sauce, Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Red Chilli Pepper & Cheese", image: "SPICY WONDER.png", price: { small: 220, medium: 440, large: 650 } },
                { name: "Mexican Special", desc: "Mexican Sauce, Onion, Capsicum, Green Chilli, Tomato, Jalapeno & Cheese", image: "MAXICAN SPECIAL2.png", price: { small: 220, medium: 440, large: 650 } },
                { name: "Chef's Veg Special Pizza", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Olives, Red Chilli Peppers & cheese", image: "CHEF'S VEG SPECIAL PIZZA.png", price: { small: 220, medium: 440, large: 650 } },
                { name: "Spl. Supreme Veg", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Olives, Jalapeno & Double Cheese", image: "SPL. SUPREME VEG.png", price: { small: 220, medium: 440, large: 650 } },
            ]
        }
    ],
    burgers: [
        { name: "Veg Tikki Burger", desc: "", image: "VEG TIKKI BURGER.png", price: 50 },
        { name: "Cheesy Burger", desc: "", image: "CHEESY BURGER.png", price: 70 },
        { name: "Crispy Veg Burger", desc: "", image: "CRISPY VEG.png", price: 90 },
        { name: "Classic Veg Burger", desc: "", image: "CLASSIC VEG.png", price: 100 },
        { name: "Monster Club Burger", desc: "", image: "MONSTER CLUB.png", price: 120 },
    ],
    wraps: [
        { name: "Veg Tikki Wrap", desc: "", image: "VEG TIKKI WRAP.png", price: 70 },
        { name: "Crispy Veg Wrap", desc: "", image: "CRISPY VEG WRAP.png", price: 90 },
        { name: "Classic Veg Wrap", desc: "", image: "CLASSIC VEG WRAP.png", price: 100 },
        { name: "Paneer Wrap", desc: "", image: "PANEER WRAP.png", price: 110 },
        { name: "Monster Club Wrap", desc: "", image: "MONSTER CLUB WRAP.png", price: 130 },
    ],
    sandwiches: [
        { name: "Veg. Grill Sandwich", desc: "", image: "VEG. GRILL SANDWICH.png", price: 80 },
        { name: "Cheese Grill Sandwich", desc: "", image: "CHEESE GRILL SANDWICH.png", price: 120 }
    ],
    sides: [
        { name: "Cheesy Garlic Bread", desc: "", image: "CHEESY GARLIC BREAD.png", price: 100 },
        { name: "Spicy Stuffed Garlic Bread", desc: "Jalapeno, Corn, Onion Inside", image: "SPICY STUFFED GARLIC BREAD.png", price: 140 },
        { name: "French Fries", desc: "", image: "FRENCH FRIES.png", price: 60 },
        { name: "Peri Peri Fries", desc: "", image: "PERI PERI FRIES.png", price: 80 },
        { name: "Red Sauce Pasta", desc: "", image: "RED SAUCE PASTA.png", price: 100 },
        { name: "White Sauce Pasta", desc: "", image: "WHITE SAUCE PASTA.png", price: 100 },
        { name: "Chilly Sauce Pasta", desc: "Red sauce spicy", image: "CHILLY SAUCE PASTA.png", price: 110 },
        { name: "Makhani Sauce Pasta", desc: "", image: "MAKHANI SAUCE PASTA.png", price: 110 },
        { name: "Tandoori Sauce Pasta", desc: "", image: "TANDOORI SAUCE PASTA.png", price: 110 },
        { name: "Veg Maggi", desc: "", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400", price: 50 },
        { name: "Cheese Maggi", desc: "", image: "CHEESE MAGGI.png", price: 70 },
        { name: "Chocolava", desc: "", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400", price: 50 }
    ],
    beverages: [
        { name: "Vanilla Shake", desc: "", image: "VANILA SHAKE.png", price: 70 },
        { name: "Strawberry Shake", desc: "", image: "STRAWBERRY SHAKE.png", price: 80 },
        { name: "Cold Coffee", desc: "", image: "COLD COFFEE.png", price: 80 },
        { name: "Chocolate Shake", desc: "", image: "CHOCOLATE SHAKE.png", price: 80 },
        { name: "Butter Scotch Shake", desc: "", image: "BUTTER SCOTCH SHAKE .png", price: 90 },
        { name: "Oreo Shake", desc: "", image: "OREO SHAKE.png", price: 100 },
        { name: "Mint Mojito", desc: "", image: "MINT MOJITO.png", price: 70 },
        { name: "Blue Ocean", desc: "", image: "BLUE OCEAN.png", price: 70 },
        { name: "Masala Soda", desc: "", image: "MASALA SODA.png", price: 70 },
        { name: "Green Apple", desc: "", image: "GREEN APPLE.png", price: 70 },
        { name: "Watermelon", desc: "", image: "WATERMELON .png", price: 70 },
        { name: "Lemon Ice Tea", desc: "", image: "LEAMON ICE TEA.png", price: 80 }
    ],
    specialOffers: [
        { name: "Buy 1 Get 1 FREE", desc: "Choose 1 from Deluxe Veg (Med/Large) & Get 1 from Supreme Veg (Med/Large) Free!", image: "Buy 1 Get 1 FREE.png", price: 340 },
        { name: "Super Value Friends Meal", desc: "1 Aloo Tikki Burger + Small French Fries + Coke (250ml)", image: "Super Value Friends Meal.png", price: 100 },
        { name: "Family Combo", desc: "1 Medium Pizza + 2 Burgers + Coke (250ml)", image: "Family Combo.png", price: 340 }
    ]
};

const seedMenu = async () => {
    try {
        console.log("Synchronizing menu database (upsert mode)...");

        const ops = [];

        // Helper: prepare pizza items
        menuData.pizzas.forEach(cat => {
            cat.items.forEach(item => {
                ops.push({
                    updateOne: {
                        filter: { name: item.name, category: 'pizza' },
                        update: {
                            $set: {
                                subCategory: cat.category,
                                desc: item.desc,
                                image: item.image,
                                prices: item.price,
                                isAvailable: true
                            }
                        },
                        upsert: true
                    }
                });
            });
        });

        // Helper: prepare other items
        const others = [
            { data: menuData.burgers, cat: 'burger' },
            { data: menuData.wraps, cat: 'wrap' },
            { data: menuData.sandwiches, cat: 'sandwich' },
            { data: menuData.sides, cat: 'side' },
            { data: menuData.beverages, cat: 'beverage' },
            { data: menuData.specialOffers, cat: 'specialOffer' }
        ];

        others.forEach(({ data, cat }) => {
            data.forEach(item => {
                ops.push({
                    updateOne: {
                        filter: { name: item.name, category: cat },
                        update: {
                            $set: {
                                desc: item.desc,
                                image: item.image,
                                price: item.price,
                                isAvailable: true
                            }
                        },
                        upsert: true
                    }
                });
            });
        });

        if (ops.length > 0) {
            await MenuItem.bulkWrite(ops);
        }

        const count = await MenuItem.countDocuments({});
        console.log(`Menu sync complete. Total items in DB: ${count}`);
    } catch (error) {
        console.error("Failed to seed/sync menu", error);
    }
}

export default seedMenu;

