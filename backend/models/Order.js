import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    size: { type: String }, // 'small', 'medium', 'large' for pizzas, 'regular' for others
    price: { type: Number, required: true },
    toppings: [{ type: String }] // List of selected topping names
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if guest POS order
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The staff member who created the order via POS
    deviceUUID: { type: String }, // For unauthenticated session tracking
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String }
    },
    orderItems: [orderItemSchema],
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderType: { type: String, required: true, enum: ['delivery', 'pickup', 'dine_in', 'pos'] }, // Added pos
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    },
    paymentMethod: { type: String, required: true, enum: ['cash', 'card', 'online', 'upi'] },
    paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed'] },
    transactionId: { type: String } // Storing Razorpay id or Stripe session eventually
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
