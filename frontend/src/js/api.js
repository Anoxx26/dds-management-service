const apiInstance = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

const api = {
    async getTransactions(queryString = '') {
        const response = await apiInstance.get(`/transactions/${queryString}`);
        return response.data;
    },

    // Создать новую транзакцию
    async createTransaction(data) {
        try {
            const response = await apiInstance.post('/transactions/', data);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async updateTransaction(id, data) {
        try {
            const response = await apiInstance.patch(`/transactions/${id}/`, data);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async deleteTransaction(id) {
        try {
            const response = await apiInstance.delete(`/transactions/${id}/`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async getCategories(typeId = '') {
        const config = typeId ? { params: { transaction_type: typeId } } : {};
        const response = await apiInstance.get('/categories/', config);
        return response.data;
    },

    async getSubcategories(categoryId = '') {
        const config = categoryId ? { params: { category: categoryId } } : {};
        const response = await apiInstance.get('/subcategories/', config);
        return response.data;
    },

    async getTransactionTypes() {
        const response = await apiInstance.get('/types/');
        return response.data;
    },

    async getStatuses() {
        const response = await apiInstance.get('/statuses/');
        return response.data;
    },

    async createStatus(data) {
        const response = await apiInstance.post('/statuses/', data);
        return response.data;
    },
    async updateStatus(id, data) {
        const response = await apiInstance.patch(`/statuses/${id}/`, data);
        return response.data;
    },
    async deleteStatus(id) {
        await apiInstance.delete(`/statuses/${id}/`);
    },

    async createTransactionType(data) {
        const response = await apiInstance.post('/types/', data);
        return response.data;
    },
    async updateTransactionType(id, data) {
        const response = await apiInstance.patch(`/types/${id}/`, data);
        return response.data;
    },
    async deleteTransactionType(id) {
        await apiInstance.delete(`/types/${id}/`);
    },

    async createCategory(data) {
        const response = await apiInstance.post('/categories/', data);
        return response.data;
    },
    async updateCategory(id, data) {
        const response = await apiInstance.patch(`/categories/${id}/`, data);
        return response.data;
    },
    async deleteCategory(id) {
        await apiInstance.delete(`/categories/${id}/`);
    },

    async createSubcategory(data) {
        const response = await apiInstance.post('/subcategories/', data);
        return response.data;
    },
    async updateSubcategory(id, data) {
        const response = await apiInstance.patch(`/subcategories/${id}/`, data);
        return response.data;
    },
    async deleteSubcategory(id) {
        await apiInstance.delete(`/subcategories/${id}/`);
    },
};


