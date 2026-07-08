const ui = {
    clearAndPlaceholder(selectElement, text) {
        selectElement.innerHTML = `<option value="" selected disabled>${text}</option>`;
    },

    fillSelect(selectElement, items, placeholderText) {
        this.clearAndPlaceholder(selectElement, placeholderText);
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    },

    renderTransactionsTable(transactions) {
        const tbody = document.getElementById('transactions-tbody');
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Транзакций не найдено</td></tr>`;
            return;
        }

        transactions.forEach(t => {
            const row = document.createElement('tr');

            const typeName = t.transaction_type ? t.transaction_type.name : '—';
            const categoryName = t.category ? t.category.name : '—';
            const subcategoryName = t.subcategory ? t.subcategory.name : '—';
            const statusName = t.status ? t.status.name : '—';

            const isIncome = typeName === 'Пополнение';
            const amountClass = isIncome ? 'text-success fw-bold' : 'text-danger fw-bold';
            const prefix = isIncome ? '+' : '-';

            row.innerHTML = `
                <td>${t.id}</td>
                <td>${new Date(t.date).toLocaleDateString('ru-RU')}</td>
                <td><span class="badge bg-secondary">${typeName}</span></td>
                <td>${categoryName}</td>
                <td>${subcategoryName}</td>
                <td><span class="badge bg-info text-dark">${statusName}</span></td>
                <td class="${amountClass}">${prefix} ${parseFloat(t.amount).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary edit-btn me-1" data-id="${t.id}">✏️</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${t.id}">❌</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    resetForm() {
        const form = document.getElementById('transaction-form');
        form.reset();
        document.getElementById('input-id').value = '';
        document.getElementById('form-title').innerText = 'Новая транзакция';
        document.getElementById('submit-btn').innerText = 'Добавить';
        document.getElementById('cancel-btn').classList.add('d-none');

        // Установка даты на сегодня по умолчанию
        const dateInput = document.getElementById('input-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },

    showErrors(errors) {
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        Object.keys(errors).forEach(fieldName => {
            const input = document.getElementById(`input-${fieldName}`);
            if (input) {
                input.classList.add('is-invalid');
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
                input.parentNode.appendChild(feedback);
            }
        });
    }
};