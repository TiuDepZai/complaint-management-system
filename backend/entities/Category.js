class Category {
    constructor(name, description = '', status = 'Active') {
        if (!name || !name.trim()) {
            throw new Error('Name is required');
        }

        this.name = name.trim();
        this.description = description;
        this.status = ['Active', 'Inactive'].includes(status) ? status : 'Active';
    }

    update({ name, description, status }) {
        if (name !== undefined) {
            const trimmed = name.trim();
            if (!trimmed) throw new Error('Name is required');
            this.name = trimmed;
        }

        if (description !== undefined) this.description = description;

        if (status !== undefined && ['Active', 'Inactive'].includes(status)) {
            this.status = status;
        }
    }

    toObject() {
        return {
            name: this.name,
            description: this.description,
            status: this.status
        };
    }
}

module.exports = Category;
