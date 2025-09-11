    const CategoryEntity = require('../entities/Category');
    

    // List all categories
    const list = async (req, res) => {
        try {
            const categories = await CategoryEntity.listAll();
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    };

    // List active categories only
    const listActive = async (req, res) => {
        console.log(req);
        try {
            const categories = await CategoryEntity.listActive();
            res.json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    };

    // Create new category
    const create = async (req, res) => {
        try {
            const { name, description, status } = req.body;

            const entity = new CategoryEntity(name, description, status);

            const category = CategoryEntity.create(entity);

            res.status(201).json(category);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Update category
    const update = async (req, res) => {
        try {
            const category = await CategoryEntity.update(req.params.id, req.body);

            res.json(category);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Delete category
    const remove = async (req, res) => {
        try {
            await CategoryEntity.remove(req.params.id);

            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    };

    module.exports = { list, listActive, create, update, remove };
