import Review from '../models/Review.js';
import User from '../models/User.js';

const reviewData = [
    {
        userName: "Aman Sharma",
        profilePic: "https://ui-avatars.com/api/?name=Aman+Sharma&background=0D8ABC&color=fff",
        rating: 5,
        text: "The best pizza in Dayalpur! The crust is perfectly crispy and the toppings are generous. Must try their Farm House pizza.",
        verifiedOrder: true,
        isFeatured: true
    },
    {
        userName: "Priya Singh",
        profilePic: "https://ui-avatars.com/api/?name=Priya+Singh&background=F06292&color=fff",
        rating: 5,
        text: "Ordered the Family Combo last night, and it was a hit! Everything was delivered hot and fresh. Great value for money.",
        verifiedOrder: true,
        isFeatured: true
    },
    {
        userName: "Rahul Verma",
        profilePic: "https://ui-avatars.com/api/?name=Rahul+Verma&background=4CAF50&color=fff",
        rating: 5,
        text: "Captain Pizza never disappoints. The staff is polite, and the service is quick. Their Buy 1 Get 1 offer is amazing!",
        verifiedOrder: true,
        isFeatured: true
    },
    {
        userName: "Sneha Gupta",
        profilePic: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=FF9800&color=fff",
        rating: 5,
        text: "Love their Margherita pizza. Simple but so delicious. The cheese quality is top-notch. Highly recommended!",
        verifiedOrder: true,
        isFeatured: true
    },
    {
        userName: "Vikas Kumar",
        profilePic: "https://ui-avatars.com/api/?name=Vikas+Kumar&background=3F51B5&color=fff",
        rating: 4,
        text: "Good experience overall. The pizzas are tasty, but the delivery took a bit longer on a weekend. Still worth the wait.",
        verifiedOrder: true,
        isFeatured: true
    },
    {
        userName: "Anjali Mehta",
        profilePic: "https://ui-avatars.com/api/?name=Anjali+Mehta&background=E91E63&color=fff",
        rating: 5,
        text: "The spicy stuffed garlic bread is a revelation! So much flavour in every bite. Captain Pizza is my go-to place now.",
        verifiedOrder: true,
        isFeatured: true
    }
];

const seedReviews = async () => {
    try {
        const count = await Review.countDocuments({});
        if (count > 0) {
            console.log(`☑️ Reviews already seeded with ${count} items.`);
            return;
        }

        console.log("Seeding initial review data...");

        // Try to find an existing user to associate with reviews if possible
        // but for now we'll just use the usernames from the seed data
        const admin = await User.findOne({ role: 'admin' });

        const documents = reviewData.map(review => ({
            ...review,
            user: admin ? admin._id : null // fallback to admin user if exists
        }));

        await Review.insertMany(documents);
        console.log("✅ Reviews seeded successfully!");
    } catch (error) {
        console.error("❌ Failed to seed reviews:", error);
    }
};

export default seedReviews;
