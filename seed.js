import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const menuData = {
    pizzas: [
        {
            category: "Simple Veg",
            id: 'simple-veg',
            items: [
                { id: "sv1", name: "Margherita", desc: "Pizza sauce & cheese", image: "MERGHERITA.png", price: { small: 110, medium: 210, large: 340 } },
                { id: "sv2", name: "Onion & Jalapeno", desc: "Pizza sauce, jalapeno & cheese", image: "ONION& JALAPENO.png", price: { small: 110, medium: 210, large: 340 } },
                { id: "sv3", name: "Sweet Corn", desc: "Pizza sauce, sweet corn & cheese", image: "SWEET CORN.png", price: { small: 110, medium: 210, large: 340 } },
                { id: "sv4", name: "Paneer & Onion", desc: "Paneer, Onion & cheese", image: "Paneer & Onion.png", price: { small: 110, medium: 210, large: 340 } },
                { id: "sv5", name: "Tomato & Capsicum", desc: "Capsicum, Tomato & cheese", image: "TOMATO & CAPSICUM.png", price: { small: 110, medium: 210, large: 340 } },
                { id: "sv6", name: "2 In 1 Veg. Pizza", desc: "Pizza sauce, Onion, Tomato & cheese", image: "2 IN 1 PIZZA.png", price: { small: 110, medium: 210, large: 340 } },
            ]
        },
        {
            category: "Classic Veg",
            id: 'classic-veg',
            items: [
                { id: "cv1", name: "Mix Masti Veg", desc: "Onion, Jalapeno, Tomato & cheese", image: "MIX MASTI VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv2", name: "Golden Lover", desc: "Onion, Capsicum, Mushroom & cheese", image: "GOLDEN LOVER .png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv3", name: "Mexican Special", desc: "Onion, Capsicum, Tomato & cheese", image: "MAXICAN SPECIAL.png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv4", name: "Spicy Veg", desc: "Onion, Capsicum, Green chillies & cheese", image: "SPICY VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv5", name: "Golden Corn Veg", desc: "Corn, Capsicum, Tomato & cheese", image: "GOLDEN CORN VEG.png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv6", name: "Farm House", desc: "Onion, Capsicum, Tomato, Mushroom & cheese", image: "FARM HOUSE.png", price: { small: 140, medium: 280, large: 410 } },
                { id: "cv7", name: "Spl. Double Chees Margerita", desc: "Pizza sauce & Double cheese", image: "SPL. DOUBLE CHEES MARGERITA.png", price: { small: 140, medium: 280, large: 410 } },
            ]
        },
        {
            category: "Deluxe Veg",
            id: 'deluxe-veg',
            items: [
                { id: "dv1", name: "Spl. Makhani Paneer", desc: "Makhani sauce, Onion, Paneer & Cheese", image: "SPL. MAKHANI PANEER.png", price: { small: 180, medium: 360, large: 520 } },
                { id: "dv2", name: "Spl. Punjabi Paneer Masti", desc: "Onion, Capsicum, Red Chilli Peppers, Paneer & cheese", image: "SPL. PUNJABI PANEER MASTI.png", price: { small: 180, medium: 360, large: 520 } },
                { id: "dv3", name: "Spl. Deluxe Mix Paneer", desc: "Tandoori Sauce, Paneer, Capsicum, Red Chilli Peppers, Onion & cheese", image: "SPL. DELUXE VEG.png", price: { small: 180, medium: 360, large: 520 } },
                { id: "dv4", name: "Spl. Spicy Peppy Paneer", desc: "Spicy Sauce, Onion, Capsicum, Paneer, Red Chili Peppers & cheese", image: "SPL. SPICY PEPPY PANEER.png", price: { small: 180, medium: 360, large: 520 } },
                { id: "dv5", name: "Spl. Deluxe Veg", desc: "Onion, Capsicum, Mushroom, Paneer, Corn & cheese", image: "SPL. DELUXE VEG.png", price: { small: 180, medium: 360, large: 520 } },
                { id: "dv6", name: "Golden Paradise", desc: "Corn, Jalapeno, Red Chilli Peppers & Cheese", image: "GOLDEN PARADISE.png", price: { small: 180, medium: 360, large: 520 } },
            ]
        },
        {
            category: "Supreme Veg",
            id: 'supreme-veg',
            items: [
                { id: "su1", name: "Extravaganza Veg", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Olives & Cheese", image: "EXTRAVAGANZA VEG.png", price: { small: 220, medium: 440, large: 650 } },
                { id: "su2", name: "Spicy Wonder", desc: "Spicy sauce, Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Red Chilli Pepper & Cheese", image: "SPICY WONDER.png", price: { small: 220, medium: 440, large: 650 } },
                { id: "su3", name: "Mexican Special", desc: "Mexican Sauce, Onion, Capsicum, Green Chilli, Tomato, Jalapeno & Cheese", image: "MAXICAN SPECIAL2.png", price: { small: 220, medium: 440, large: 650 } },
                { id: "su4", name: "Chef's Veg Special Pizza", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Jalapeno, Olives, Red Chilli Peppers & cheese", image: "CHEF'S VEG SPECIAL PIZZA.png", price: { small: 220, medium: 440, large: 650 } },
                { id: "su5", name: "Spl. Supreme Veg", desc: "Onion, Capsicum, Mushroom, Corn, Paneer, Olives, Jalapeno & Double Cheese", image: "SPL. SUPREME VEG.png", price: { small: 220, medium: 440, large: 650 } },
            ]
        }
    ],
    burgers: [
        { id: "b1", name: "Veg Tikki Burger", desc: "", image: "VEG TIKKI BURGER.png", price: 50 },
        { id: "b2", name: "Cheesy Burger", desc: "", image: "CHEESY BURGER.png", price: 70 },
        { id: "b3", name: "Crispy Veg Burger", desc: "", image: "CRISPY VEG.png", price: 90 },
        { id: "b4", name: "Classic Veg Burger", desc: "", image: "CLASSIC VEG.png", price: 100 },
        { id: "b5", name: "Monster Club Burger", desc: "", image: "MONSTER CLUB.png", price: 120 },
    ],
    wraps: [
        { id: "w1", name: "Veg Tikki Wrap", desc: "", image: "VEG TIKKI WRAP.png", price: 70 },
        { id: "w2", name: "Crispy Veg Wrap", desc: "", image: "CRISPY VEG WRAP.png", price: 90 },
        { id: "w3", name: "Classic Veg Wrap", desc: "", image: "CLASSIC VEG WRAP.png", price: 100 },
        { id: "w4", name: "Paneer Wrap", desc: "", image: "PANEER WRAP.png", price: 110 },
        { id: "w5", name: "Monster Club Wrap", desc: "", image: "MONSTER CLUB WRAP.png", price: 130 },
    ],
    sandwiches: [
        { id: "s1", name: "Veg. Grill Sandwich", desc: "", image: "VEG. GRILL SANDWICH.png", price: 80 },
        { id: "s2", name: "Cheese Grill Sandwich", desc: "", image: "CHEESE GRILL SANDWICH.png", price: 120 }
    ],
    sides: [
        { id: "sd1", name: "Cheesy Garlic Bread", desc: "", image: "CHEESY GARLIC BREAD.png", price: 100 },
        { id: "sd2", name: "Spicy Stuffed Garlic Bread", desc: "Jalapeno, Corn, Onion Inside", image: "SPICY STUFFED GARLIC BREAD.png", price: 140 },
        { id: "sd3", name: "French Fries", desc: "", image: "FRENCH FRIES.png", price: 60 },
        { id: "sd4", name: "Peri Peri Fries", desc: "", image: "PERI PERI FRIES.png", price: 80 },
        { id: "sd5", name: "Red Sauce Pasta", desc: "", image: "RED SAUCE PASTA.png", price: 100 },
        { id: "sd6", name: "White Sauce Pasta", desc: "", image: "WHITE SAUCE PASTA.png", price: 100 },
        { id: "sd7", name: "Chilly Sauce Pasta", desc: "Red sauce spicy", image: "CHILLY SAUCE PASTA.png", price: 110 },
        { id: "sd8", name: "Makhani Sauce Pasta", desc: "", image: "MAKHANI SAUCE PASTA.png", price: 110 },
        { id: "sd9", name: "Tandoori Sauce Pasta", desc: "", image: "TANDOORI SAUCE PASTA.png", price: 110 }
    ],
    beverages: [
        { id: "bv1", name: "Vanilla Shake", desc: "", image: "VANILA SHAKE.png", price: 70 },
        { id: "bv2", name: "Strawberry Shake", desc: "", image: "STRAWBERRY SHAKE.png", price: 80 },
        { id: "bv3", name: "Cold Coffee", desc: "", image: "COLD COFFEE.png", price: 80 },
        { id: "bv4", name: "Chocolate Shake", desc: "", image: "CHOCOLATE SHAKE.png", price: 80 },
        { id: "bv5", name: "Butter Scotch Shake", desc: "", image: "BUTTER SCOTCH SHAKE .png", price: 90 },
        { id: "bv6", name: "Oreo Shake", desc: "", image: "OREO SHAKE.png", price: 100 },
        { id: "bv7", name: "Mint Mojito", desc: "", image: "MINT MOJITO.png", price: 70 },
        { id: "bv8", name: "Blue Ocean", desc: "", image: "BLUE OCEAN.png", price: 70 },
        { id: "bv9", name: "Masala Soda", desc: "", image: "MASALA SODA.png", price: 70 },
        { id: "bv10", name: "Green Apple", desc: "", image: "GREEN APPLE.png", price: 70 },
        { id: "bv11", name: "Watermelon", desc: "", image: "WATERMELON .png", price: 70 },
        { id: "bv12", name: "Lemon Ice Tea", desc: "", image: "LEAMON ICE TEA.png", price: 80 }
    ],
    cheapMeals: [
        { id: "cm1", name: "Regular Menu Special", desc: "1 Pizza + Garlic Bread + Cold Drink", image: "Buy 1 Get 1 FREE.png", price: 150 },
        { id: "cm2", name: "Couple Combo", desc: "2 Pizzas + Fries + Cold Drinks", image: "Super Value Friends Meal.png", price: 299 },
        { id: "cm3", name: "Family Pack", desc: "4 Pizzas + Stuffed Garlic Bread + Drinks", image: "Family Combo.png", price: 599 }
    ]
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("MongoDB Connected. Seeding...");
        await MenuItem.deleteMany({}); // Delete all existing

        const documents = [];

        menuData.pizzas.forEach(cat => {
            cat.items.forEach(item => {
                documents.push({
                    name: item.name,
                    category: 'pizza',
                    subCategory: cat.category,
                    desc: item.desc,
                    image: item.image,
                    prices: item.price
                });
            });
        });

        menuData.burgers.forEach(item => documents.push({ name: item.name, category: 'burger', desc: item.desc, image: item.image, price: item.price }));
        menuData.wraps.forEach(item => documents.push({ name: item.name, category: 'wrap', desc: item.desc, image: item.image, price: item.price }));
        menuData.sandwiches.forEach(item => documents.push({ name: item.name, category: 'sandwich', desc: item.desc, image: item.image, price: item.price }));
        menuData.sides.forEach(item => documents.push({ name: item.name, category: 'side', desc: item.desc, image: item.image, price: item.price }));
        menuData.beverages.forEach(item => documents.push({ name: item.name, category: 'beverage', desc: item.desc, image: item.image, price: item.price }));
        menuData.cheapMeals.forEach(item => documents.push({ name: item.name, category: 'cheapMeal', desc: item.desc, image: item.image, price: item.price }));

        await MenuItem.insertMany(documents);
        console.log("Seeding complete! Admin panel will now show all menu items.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();
