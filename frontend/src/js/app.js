document.addEventListener('DOMContentLoaded', async () => {
    // --- ЭЛЕМЕНТЫ ФОРМЫ ТРАНЗАКЦИИ ---
    const typeSelect = document.getElementById('input-transaction_type');
    const categorySelect = document.getElementById('input-category');
    const subcategorySelect = document.getElementById('input-subcategory');
    const statusSelect = document.getElementById('input-status');
    const transactionForm = document.getElementById('transaction-form');
    const tbody = document.getElementById('transactions-tbody');

    // --- ЭЛЕМЕНТЫ БЛОКА ФИЛЬТРАЦИИ ---
    const filterForm = document.getElementById('filter-form');
    const filterStatusSelect = document.getElementById('filter-status');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterCategorySelect = document.getElementById('filter-category');
    const filterSubcategorySelect = document.getElementById('filter-subcategory');

    // Хранилище загруженных транзакций для быстрого поиска при редактировании
    let localTransactions = [];

    // Функция загрузки и обновления таблицы с query-параметрами
    async function loadTable(queryString = '') {
        try {
            localTransactions = await api.getTransactions(queryString);
            ui.renderTransactionsTable(localTransactions);
        } catch (err) {
            console.error('Ошибка загрузки таблицы транзакций:', err);
        }
    }

    // Инициализация приложения при первой загрузке страницы
    try {
        const [categories, statuses] = await Promise.all([
            api.getCategories(),
            api.getStatuses()
        ]);

        // Наполняем статус в форме
        ui.fillSelect(statusSelect, statuses, 'Выберите статус...');

        // Наполняем статус в фильтре
        if (filterStatusSelect) {
            ui.fillSelect(filterStatusSelect, statuses, 'Все статусы');
            filterStatusSelect.options[0].value = "";
        }

        // Блокируем селекты формы и расширенных фильтров до выбора родительских сущностей
        categorySelect.disabled = true;
        subcategorySelect.disabled = true;
        if (filterCategorySelect) filterCategorySelect.disabled = true;
        if (filterSubcategorySelect) filterSubcategorySelect.disabled = true;

        // Очищаем форму и загружаем актуальную таблицу
        ui.resetForm();
        await loadTable();

    } catch (err) {
        console.error('Ошибка инициализации приложения:', err);
    }

    // --- ДИНАМИЧЕСКАЯ ФИЛЬТРАЦИЯ СЕЛЕКТОВ В ФОРМЕ СОЗДАНИЯ ---
    // Смена типа операции -> Подгрузка категорий в форму
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

    // Смена категории -> Подгрузка подкатегорий в форму
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


    // --- ДИНАМИЧЕСКИЕ СЕЛЕКТЫ В БЛОКЕ ФИЛЬТРОВ (5 параметров ТЗ) ---
    if (filterTypeSelect && filterCategorySelect && filterSubcategorySelect) {

        // Выбор типа в фильтре -> подгрузка категорий для фильтра
        filterTypeSelect.addEventListener('change', async (e) => {
            const typeId = e.target.value;
            filterCategorySelect.disabled = true;
            filterSubcategorySelect.disabled = true;
            filterSubcategorySelect.innerHTML = '<option value="" selected>Все подкатегории</option>';

            if (typeId) {
                const filteredCategories = await api.getCategories(typeId);
                ui.fillSelect(filterCategorySelect, filteredCategories, 'Все категории');
                filterCategorySelect.options[0].value = ""; // Делаем значение пустой строкой для сброса
                filterCategorySelect.disabled = false;
            } else {
                filterCategorySelect.innerHTML = '<option value="" selected>Все категории</option>';
            }
            triggerFilter(); // Запускаем фильтрацию таблицы
        });

        // Выбор категории в фильтре -> подгрузка подкатегорий для фильтра
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
                    filterSubcategorySelect.innerHTML = '<option value="" selected>Нет подкатегорий</option>';
                    filterSubcategorySelect.options[0].value = "";
                }
            } else {
                filterSubcategorySelect.innerHTML = '<option value="" selected>Все подкатегории</option>';
            }
            triggerFilter();
        });
    }

    // Функция сбора параметров со всей формы фильтрации и отправки запроса
    async function triggerFilter() {
        if (!filterForm) return;

        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        // Добавляем параметры в строку запроса, только если они выбраны/заполнены
        if (formData.get('start_date')) params.append('start_date', formData.get('start_date'));
        if (formData.get('end_date')) params.append('end_date', formData.get('end_date'));
        if (formData.get('status')) params.append('status', formData.get('status'));
        if (formData.get('transaction_type')) params.append('transaction_type', formData.get('transaction_type'));
        if (formData.get('category')) params.append('category', formData.get('category'));
        if (formData.get('subcategory')) params.append('subcategory', formData.get('subcategory'));

        const queryString = params.toString() ? `?${params.toString()}` : '';
        await loadTable(queryString);
    }

    // Слушаем ручной ввод дат, статуса или подкатегории в блоке фильтров
    if (filterForm) {
        filterForm.addEventListener('input', (e) => {
            // Селекты типов и категорий обрабатываются отдельно через события 'change' выше
            if (e.target.id !== 'filter-type' && e.target.id !== 'filter-category') {
                triggerFilter();
            }
        });

        // Слушаем кнопку сброса всех установленных фильтров
        const resetBtn = document.getElementById('filter-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                filterForm.reset();

                // Сбрасываем и блокируем зависимые элементы
                filterCategorySelect.innerHTML = '<option value="" selected>Все категории</option>';
                filterSubcategorySelect.innerHTML = '<option value="" selected>Все подкатегории</option>';
                filterCategorySelect.disabled = true;
                filterSubcategorySelect.disabled = true;

                // Загружаем чистую таблицу
                await loadTable();
            });
        }
    }


    // --- ОБРАБОТКА ОТПРАВКИ ФОРМЫ ТРАНЗАКЦИИ (Создание или Обновление) ---
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(transactionForm);
        const id = document.getElementById('input-id').value;

        // Собираем валидный payload для бэкенда
        const payload = {
            amount: formData.get('amount'),
            transaction_type: parseInt(formData.get('transaction_type')),
            category: parseInt(formData.get('category')),
            subcategory: formData.get('subcategory') ? parseInt(formData.get('subcategory')) : null,
            status: parseInt(formData.get('status')),
            comment: formData.get('comment')
        };

        // Если дата заполнена на фронте, передаем её
        if (formData.get('date')) {
            payload.date = formData.get('date');
        }

        try {
            if (id) {
                // Режим РЕДАКТИРОВАНИЯ (используем бережный patch)
                await api.updateTransaction(id, payload);
            } else {
                // Режим СОЗДАНИЯ
                await api.createTransaction(payload);
            }

            // После успешного сохранения очищаем форму и блокируем зависимые селекты
            ui.resetForm();
            categorySelect.disabled = true;
            subcategorySelect.disabled = true;

            await loadTable();

            // Удаляем старые классы ошибок валидации
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        } catch (serverErrors) {
            if (typeof serverErrors === 'object') {
                ui.showErrors(serverErrors);
            } else {
                alert('Ошибка валидации данных на сервере. Проверьте зависимости сущностей.');
                console.error(serverErrors);
            }
        }
    });

    // --- ДЕЛИГИРОВАНИЕ КЛИКОВ В ТАБЛИЦЕ (Редактирование / Удаление) ---
    tbody.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        // Логика удаления записи
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm(`Вы уверены, что хотите удалить транзакцию #${id}?`)) {
                try {
                    await api.deleteTransaction(id);
                    await loadTable();
                } catch (err) {
                    console.error('Не удалось удалить запись:', err);
                }
            }
        }

        // Логика редактирования записи (наполнение формы данными выбранной строки)
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            const transaction = localTransactions.find(t => t.id === id);

            if (transaction) {
                // Переключаем форму визуально в режим редактирования
                document.getElementById('form-title').innerText = `Редактирование #${id}`;
                document.getElementById('submit-btn').innerText = 'Сохранить';
                document.getElementById('cancel-btn').classList.remove('d-none');

                // Заполняем текстовые и числовые поля формы
                document.getElementById('input-id').value = transaction.id;
                document.getElementById('input-date').value = transaction.date ? transaction.date.split('T')[0] : '';
                document.getElementById('input-amount').value = transaction.amount;
                document.getElementById('input-comment').value = transaction.comment || '';

                // Выставляем предустановленный статус
                document.getElementById('input-status').value = transaction.status ? transaction.status.id : '';

                // Асинхронное последовательное восстановление связанных селектов (цепочка связей ТЗ)
                if (transaction.transaction_type) {
                    typeSelect.value = transaction.transaction_type.id;

                    // 1. Принудительно подгружаем и заполняем категории для этого типа
                    const filteredCategories = await api.getCategories(transaction.transaction_type.id);
                    ui.fillSelect(categorySelect, filteredCategories, 'Выберите категорию...');
                    categorySelect.disabled = false;

                    if (transaction.category) {
                        categorySelect.value = transaction.category.id;

                        // 2. Принудительно подгружаем и заполняем подкатегории для этой категории
                        const filteredSubcategories = await api.getSubcategories(transaction.category.id);
                        if (filteredSubcategories.length > 0) {
                            ui.fillSelect(subcategorySelect, filteredSubcategories, 'Выберите подкатегорию...');
                            subcategorySelect.disabled = false;

                            if (transaction.subcategory) {
                                subcategorySelect.value = transaction.subcategory.id;
                            }
                        } else {
                            ui.clearAndPlaceholder(subcategorySelect, 'Нет подкатегорий');
                        }
                    }
                }
            }
        }
    });
});