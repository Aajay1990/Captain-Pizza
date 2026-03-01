import Topping from '../models/Topping.js';

export const getToppings = async (req, res) => {
    try {
        const toppings = await Topping.find({});
        res.status(200).json({ success: true, data: toppings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching toppings' });
    }
};

export const createTopping = async (req, res) => {
    try {
        const topping = await Topping.create(req.body);
        res.status(201).json({ success: true, data: topping });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating topping' });
    }
};

export const updateTopping = async (req, res) => {
    try {
        const topping = await Topping.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!topping) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: topping });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating topping' });
    }
};

export const deleteTopping = async (req, res) => {
    try {
        const topping = await Topping.findByIdAndDelete(req.params.id);
        if (!topping) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting topping' });
    }
};
