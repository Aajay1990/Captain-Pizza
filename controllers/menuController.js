import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenu = async (req, res) => {
    try {
        const { all } = req.query;
        const query = all === 'true' ? {} : { isAvailable: true };
        const menu = await MenuItem.find(query);
        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving menu items.' });
    }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin (Right now open for dev phase)
export const createMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.create(req.body);
        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: 'Could not create menu item', error: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ success: false, message: 'Could not update menu item', error: error.message });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, message: 'Item removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting menu item' });
    }
};
// @desc    Update all items in a category (Rename category)
// @route   PUT /api/menu/category/rename
// @access  Private/Admin
export const updateCategoryName = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ success: false, message: 'Both old and new category names are required' });
        }
        const result = await MenuItem.updateMany({ category: oldName }, { category: newName });
        res.status(200).json({ success: true, message: `Successfully updated ${result.modifiedCount} items from "${oldName}" to "${newName}"` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
