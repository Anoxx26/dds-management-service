document.addEventListener('DOMContentLoaded', async () => {
    // Хранилища данных
    let statuses = [];
    let types = [];
    let categories = [];
    let subcategories = [];

    // Переменные для отслеживания текущего редактируемого ID для каждой сущности
    let editingStatusId = null;
    let editingTypeId = null;
    let editingCategoryId = null;
    let editingSubcategoryId = null;

    // Инициализация загрузки таблиц
    async function init() {
        try {
            statuses = await api.getStatuses();

            const responseCategories = await apiInstance.get('/categories/');
            categories = responseCategories.data;

            const responseSubcategories = await apiInstance.get('/subcategories/');
            subcategories = responseSubcategories.data;

            const responseTypes = await apiInstance.get('/types/');
            types = responseTypes.data;

            renderAll();
            fillRelationSelects();
        } catch (err) {
            console.error('Ошибка загрузки справочников:', err);
        }
    }

    // Рендеринг всех сущностей в DOM
    function renderAll() {
        // Статусы
        const statusTbody = document.getElementById('statuses-tbody');
        statusTbody.innerHTML = statuses.map(s => {
            const isEditing = editingStatusId === s.id;
            return `
                <tr class="${isEditing ? 'table-warning' : ''}">
                    <td>${s.id}</td>
                    <td>${s.name}</td>
                    <td class="text-end">
                        <button class="btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline-primary'} me-1" 
                                onclick="${isEditing ? "cancelEdit('status')" : `editItem('status', ${s.id})`}">
                            ${isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('status', ${s.id})" ${isEditing ? 'disabled' : ''}>Удалить</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Типы
        const typeTbody = document.getElementById('types-tbody');
        typeTbody.innerHTML = types.map(t => {
            const isEditing = editingTypeId === t.id;
            return `
                <tr class="${isEditing ? 'table-warning' : ''}">
                    <td>${t.id}</td>
                    <td>${t.name}</td>
                    <td class="text-end">
                        <button class="btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline-primary'} me-1" 
                                onclick="${isEditing ? "cancelEdit('type')" : `editItem('type', ${t.id})`}">
                            ${isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('type', ${t.id})" ${isEditing ? 'disabled' : ''}>Удалить</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Категории
        const categoryTbody = document.getElementById('categories-tbody');
        categoryTbody.innerHTML = categories.map(c => {
            const isEditing = editingCategoryId === c.id;
            return `
                <tr class="${isEditing ? 'table-warning' : ''}">
                    <td>${c.id}</td>
                    <td><strong>${c.name}</strong></td>
                    <td><span class="badge bg-secondary">${c.transaction_type_name || (c.transaction_type ? c.transaction_type.name : '')}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline-primary'} me-1" 
                                onclick="${isEditing ? "cancelEdit('category')" : `editItem('category', ${c.id})`}">
                            ${isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('category', ${c.id})" ${isEditing ? 'disabled' : ''}>Удалить</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Подкатегории
        const subcategoryTbody = document.getElementById('subcategories-tbody');
        subcategoryTbody.innerHTML = subcategories.map(s => {
            const isEditing = editingSubcategoryId === s.id;
            return `
                <tr class="${isEditing ? 'table-warning' : ''}">
                    <td>${s.id}</td>
                    <td><strong>${s.name}</strong></td>
                    <td><span class="badge bg-light text-dark">${s.category_name || (s.category ? s.category.name : '')}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline-primary'} me-1" 
                                onclick="${isEditing ? "cancelEdit('subcategory')" : `editItem('subcategory', ${s.id})`}">
                            ${isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('subcategory', ${s.id})" ${isEditing ? 'disabled' : ''}>Удалить</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Заполнение селектов зависимостей в формах управления
    function fillRelationSelects() {
        const catTypeSelect = document.getElementById('category-crud-type');
        catTypeSelect.innerHTML = '<option value="" selected disabled>Привязать к типу...</option>' +
            types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        const subCatSelect = document.getElementById('subcategory-crud-category');
        subCatSelect.innerHTML = '<option value="" selected disabled>Привязать к категории...</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДА ФОРМ В РЕЖИМ РЕДАКТИРОВАНИЯ
    window.editItem = function (entity, id) {
        // Сначала сбрасываем старое редактирование для этой же сущности, если оно было
        cancelEdit(entity, false);

        if (entity === 'status') {
            const item = statuses.find(s => s.id === id);
            if (!item) return;
            editingStatusId = id;
            document.getElementById('status-id').value = item.id;
            document.getElementById('status-name').value = item.name;
            document.getElementById('status-submit').innerText = 'Сохранить';
            document.getElementById('status-submit').className = 'btn btn-success w-100';
        }

        if (entity === 'type') {
            const item = types.find(t => t.id === id);
            if (!item) return;
            editingTypeId = id;
            document.getElementById('type-id').value = item.id;
            document.getElementById('type-name').value = item.name;
            document.getElementById('type-submit').innerText = 'Сохранить';
            document.getElementById('type-submit').className = 'btn btn-success w-100';
        }

        if (entity === 'category') {
            fillRelationSelects();
            const item = categories.find(c => c.id === id);
            if (!item) return;
            editingCategoryId = id;
            document.getElementById('category-crud-id').value = item.id;
            document.getElementById('category-crud-name').value = item.name;
            const typeId = item.transaction_type;
            const select = document.getElementById('category-crud-type');
            select.value = typeId;
            document.getElementById('category-crud-submit').innerText = 'Сохранить изменения';
            document.getElementById('category-crud-submit').className = 'btn btn-success w-100 text-white fw-bold';
        }

        if (entity === 'subcategory') {
            fillRelationSelects();
            const item = subcategories.find(s => s.id === id);
            if (!item) return;
            editingSubcategoryId = id;
            document.getElementById('subcategory-crud-id').value = item.id;
            document.getElementById('subcategory-crud-name').value = item.name;
            const catId = item.category;
            const select = document.getElementById('subcategory-crud-category');
            select.value = catId;
            document.getElementById('subcategory-crud-submit').innerText = 'Сохранить изменения';
            document.getElementById('subcategory-crud-submit').className = 'btn btn-success w-100 text-white fw-bold';
        }

        renderAll(); // Перерисовываем кнопки в таблице

    };

    // ФУНКЦИЯ ОТМЕНЫ РЕДАКТИРОВАНИЯ И ВОЗВРАТА ФОРМЫ В ДЕФОЛТ
    window.cancelEdit = function (entity, shouldRender = true) {
        if (entity === 'status') {
            editingStatusId = null;
            document.getElementById('status-form').reset();
            document.getElementById('status-id').value = '';
            document.getElementById('status-submit').innerText = 'Добавить';
            document.getElementById('status-submit').className = 'btn btn-primary w-100';
        }
        if (entity === 'type') {
            editingTypeId = null;
            document.getElementById('type-form').reset();
            document.getElementById('type-id').value = '';
            document.getElementById('type-submit').innerText = 'Добавить';
            document.getElementById('type-submit').className = 'btn btn-success w-100';
        }
        if (entity === 'category') {
            editingCategoryId = null;
            document.getElementById('category-crud-form').reset();
            document.getElementById('category-crud-id').value = '';
            document.getElementById('category-crud-submit').innerText = 'Добавить категорию';
            document.getElementById('category-crud-submit').className = 'btn btn-warning w-100 text-dark fw-bold';
        }
        if (entity === 'subcategory') {
            editingSubcategoryId = null;
            document.getElementById('subcategory-crud-form').reset();
            document.getElementById('subcategory-crud-id').value = '';
            document.getElementById('subcategory-crud-submit').innerText = 'Добавить подкатегорию';
            document.getElementById('subcategory-crud-submit').className = 'btn btn-info w-100 text-dark fw-bold';
        }

        if (shouldRender) renderAll();
    };

    // Глобальная функция удаления для кнопок в таблицах
    window.deleteItem = async function (entity, id) {
        if (!confirm('Вы уверены, что хотите удалить элемент справочника? Это может повлиять на существующие транзакции.')) return;
        try {
            if (entity === 'status') await api.deleteStatus(id);
            if (entity === 'type') await api.deleteTransactionType(id);
            if (entity === 'category') await api.deleteCategory(id);
            if (entity === 'subcategory') await api.deleteSubcategory(id);
            await init();
        } catch (err) {
            alert('Не удалось удалить элемент. Возможно, он используется в транзакциях.');
        }
    };

    // ОБРАБОТКА ФОРМ (Создание или Обновление)
    document.getElementById('status-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('status-id').value;
        const name = document.getElementById('status-name').value;

        if (id) {
            await api.updateStatus(id, { name });
        } else {
            await api.createStatus({ name });
        }

        cancelEdit('status', false);
        await init();
    });

    document.getElementById('type-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('type-id').value;
        const name = document.getElementById('type-name').value;

        if (id) {
            await api.updateTransactionType(id, { name });
        } else {
            await api.createTransactionType({ name });
        }

        cancelEdit('type', false);
        await init();
    });

    document.getElementById('category-crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('category-crud-id').value;
        const name = document.getElementById('category-crud-name').value;
        const transaction_type = parseInt(document.getElementById('category-crud-type').value);

        if (id) {
            await api.updateCategory(id, { name, transaction_type });
        } else {
            await api.createCategory({ name, transaction_type });
        }

        cancelEdit('category', false);
        await init();
    });

    document.getElementById('subcategory-crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('subcategory-crud-id').value;
        const name = document.getElementById('subcategory-crud-name').value;
        const category = parseInt(document.getElementById('subcategory-crud-category').value);

        if (id) {
            await api.updateSubcategory(id, { name, category });
        } else {
            await api.createSubcategory({ name, category });
        }

        cancelEdit('subcategory', false);
        await init();
    });

    // Запуск
    await init();
});