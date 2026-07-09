document.addEventListener('DOMContentLoaded', async () => {
    const typeSelect = document.getElementById('input-transaction_type');
    const categorySelect = document.getElementById('input-category');
    const subcategorySelect = document.getElementById('input-subcategory');
    const statusSelect = document.getElementById('input-status');
    const transactionForm = document.getElementById('transaction-form');
    const tbody = document.getElementById('transactions-tbody');
    const transactionModalEl = document.getElementById('transactionModal');
    const filterForm = document.getElementById('filter-form');
    const filterStatusSelect = document.getElementById('filter-status');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterCategorySelect = document.getElementById('filter-category');
    const filterSubcategorySelect = document.getElementById('filter-subcategory');

    let localTransactions = [];

    async function loadTable(queryString = '') {
        try {
            localTransactions = await api.getTransactions(queryString);
            ui.renderTransactionsTable(localTransactions);
        } catch (err) {
            console.error('Ошибка загрузки таблицы транзакций:', err);
        }
    }

    try {
        const [categories, statuses, transactionTypes] = await Promise.all([
            api.getCategories(),
            api.getStatuses(),
            api.getTransactionTypes()
        ]);

        ui.fillSelect(statusSelect, statuses, 'Выберите статус...');
        if (filterStatusSelect) {
            ui.fillSelect(filterStatusSelect, statuses, 'Все статусы');
            filterStatusSelect.options[0].value = "";
        }

        if (filterTypeSelect) {
            ui.fillSelect(filterTypeSelect, transactionTypes, 'Все типы');
            filterTypeSelect.options[0].value = "";
        }

        if (typeSelect) {
            ui.fillSelect(typeSelect, transactionTypes, 'Выберите тип...');
        }

        categorySelect.disabled = true;
        subcategorySelect.disabled = true;
        if (filterCategorySelect) filterCategorySelect.disabled = true;
        if (filterSubcategorySelect) filterSubcategorySelect.disabled = true;

        ui.resetForm();
        await loadTable();
    } catch (err) {
        console.error('Ошибка инициализации приложения:', err);
    }

    typeSelect.addEventListener('change', async (e) => {
        const typeId = e.target.value;
        categorySelect.disabled = true;
        subcategorySelect.disabled = true;
        ui.clearAndPlaceholder(subcategorySelect, 'Сначала выберите категорию...');
        if (typeId) {
            const filteredCategories = await api.getCategories(typeId);
            ui.fillSelect(categorySelect, filteredCategories, 'Выберите категорию...');
            categorySelect.disabled = false;
        } else {
            ui.clearAndPlaceholder(categorySelect, 'Сначала выберите тип...');
        }
    });

    categorySelect.addEventListener('change', async (e) => {
        const categoryId = e.target.value;
        subcategorySelect.disabled = true;
        if (categoryId) {
            const filteredSubcategories = await api.getSubcategories(categoryId);
            if (filteredSubcategories.length > 0) {
                ui.fillSelect(subcategorySelect, filteredSubcategories, 'Выберите подкатегорию...');
                subcategorySelect.disabled = false;
            } else {
                ui.clearAndPlaceholder(subcategorySelect, 'Нет подкатегорий');
            }
        } else {
            ui.clearAndPlaceholder(subcategorySelect, 'Сначала выберите категорию...');
        }
    });

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(transactionForm);
        const id = document.getElementById('input-id').value;

        const payload = {
            amount: formData.get('amount'),
            transaction_type: parseInt(formData.get('transaction_type')),
            category: parseInt(formData.get('category')),
            subcategory: formData.get('subcategory') ? parseInt(formData.get('subcategory')) : null,
            status: parseInt(formData.get('status')),
            comment: formData.get('comment')
        };
        if (formData.get('date')) payload.date = formData.get('date');

        try {
            if (id) {
                await api.updateTransaction(id, payload);
            } else {
                await api.createTransaction(payload);
            }

            ui.resetForm();
            categorySelect.disabled = true;
            subcategorySelect.disabled = true;
            await loadTable();

            const modal = bootstrap.Modal.getInstance(transactionModalEl);
            if (modal) modal.hide();

            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        } catch (serverErrors) {
            if (typeof serverErrors === 'object') ui.showErrors(serverErrors);
            else alert('Ошибка валидации данных.');
        }
    });

    transactionModalEl.addEventListener('hidden.bs.modal', () => {
        ui.resetForm();

        document.getElementById('form-title').innerText = 'Новая транзакция';
        document.getElementById('submit-btn').innerText = 'Добавить';
        document.getElementById('cancel-btn').classList.add('d-none');
        document.getElementById('input-id').value = '';
        document.getElementById('input-category').disabled = true;
        document.getElementById('input-subcategory').disabled = true;
    });

    async function triggerFilter() {
        if (!filterForm) return;

        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (let [key, value] of formData.entries()) {
            if (value) {
                params.append(key, value);
            }
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';
        await loadTable(queryString);
    }

    // Слушаем изменения на всей форме фильтра (для дат и статуса)
    if (filterForm) {
        filterForm.addEventListener('change', (e) => {
            if (e.target.id !== 'filter-type' && e.target.id !== 'filter-category') {
                triggerFilter();
            }
        });
    }

    // Логика взаимосвязанных селектов в фильтрах (Тип -> Категория -> Подкатегория)
    if (filterTypeSelect) {
        filterTypeSelect.addEventListener('change', async (e) => {
            const typeId = e.target.value;
            filterCategorySelect.disabled = true;
            filterSubcategorySelect.disabled = true;
            ui.clearAndPlaceholder(filterSubcategorySelect, 'Все подкатегории');
            filterSubcategorySelect.options[0].value = "";

            if (typeId) {
                const filteredCategories = await api.getCategories(typeId);
                ui.fillSelect(filterCategorySelect, filteredCategories, 'Все категории');
                filterCategorySelect.options[0].value = "";
                filterCategorySelect.disabled = false;
            } else {
                ui.clearAndPlaceholder(filterCategorySelect, 'Все категории');
                filterCategorySelect.options[0].value = "";
            }
            triggerFilter();
        });
    }

    if (filterCategorySelect) {
        filterCategorySelect.addEventListener('change', async (e) => {
            const categoryId = e.target.value;
            filterSubcategorySelect.disabled = true;

            if (categoryId) {
                const filteredSubcategories = await api.getSubcategories(categoryId);
                if (filteredSubcategories.length > 0) {
                    ui.fillSelect(filterSubcategorySelect, filteredSubcategories, 'Все подкатегории');
                    filterSubcategorySelect.options[0].value = "";
                    filterSubcategorySelect.disabled = false;
                } else {
                    ui.clearAndPlaceholder(filterSubcategorySelect, 'Нет подкатегорий');
                    filterSubcategorySelect.options[0].value = "";
                }
            } else {
                ui.clearAndPlaceholder(filterSubcategorySelect, 'Все подкатегории');
                filterSubcategorySelect.options[0].value = "";
            }
            triggerFilter();
        });
    }

    if (filterSubcategorySelect) {
        filterSubcategorySelect.addEventListener('change', triggerFilter);
    }

    const filterResetBtn = document.getElementById('filter-reset-btn');
    if (filterResetBtn && filterForm) {
        filterResetBtn.addEventListener('click', async () => {
            filterForm.reset();

            if (filterCategorySelect) {
                ui.clearAndPlaceholder(filterCategorySelect, 'Все категории');
                filterCategorySelect.options[0].value = "";
                filterCategorySelect.disabled = true;
            }
            if (filterSubcategorySelect) {
                ui.clearAndPlaceholder(filterSubcategorySelect, 'Все подкатегории');
                filterSubcategorySelect.options[0].value = "";
                filterSubcategorySelect.disabled = true;
            }

            await loadTable();
        });
    }

    tbody.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm(`Удалить транзакцию #${id}?`)) {
                await api.deleteTransaction(id);
                await loadTable();
            }
        }

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            const transaction = localTransactions.find(t => t.id === id);

            if (transaction) {
                document.getElementById('form-title').innerText = `Редактирование #${id}`;
                document.getElementById('submit-btn').innerText = 'Сохранить';
                document.getElementById('cancel-btn').classList.remove('d-none');

                document.getElementById('input-id').value = transaction.id;
                document.getElementById('input-date').value = transaction.date ? transaction.date.split('T')[0] : '';
                document.getElementById('input-amount').value = transaction.amount;
                document.getElementById('input-comment').value = transaction.comment || '';
                document.getElementById('input-status').value = transaction.status ? transaction.status.id : '';

                if (transaction.transaction_type) {
                    typeSelect.value = transaction.transaction_type.id;
                    const filteredCategories = await api.getCategories(transaction.transaction_type.id);
                    ui.fillSelect(categorySelect, filteredCategories, 'Выберите категорию...');
                    categorySelect.disabled = false;
                    categorySelect.value = transaction.category ? transaction.category.id : '';

                    if (transaction.category) {
                        const filteredSubcategories = await api.getSubcategories(transaction.category.id);
                        ui.fillSelect(subcategorySelect, filteredSubcategories, 'Выберите подкатегорию...');
                        subcategorySelect.disabled = false;
                        subcategorySelect.value = transaction.subcategory ? transaction.subcategory.id : '';
                    }
                }

                const modal = new bootstrap.Modal(transactionModalEl);
                modal.show();
            }
        }
    });
});