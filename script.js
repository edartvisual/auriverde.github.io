document.addEventListener('DOMContentLoaded', function() {
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const typeInput = document.getElementById('type');
    const dateInput = document.getElementById('date');
    const amountInput = document.getElementById('amount');
    const balanceSpan = document.getElementById('balance');
    const balanceStatus = document.getElementById('balance-status');
    const transactionList = document.getElementById('transaction-list');
    const generateReportButton = document.getElementById('generate-report');
    const reportDiv = document.getElementById('report');
    const entryList = document.getElementById('entry-list');
    const exitList = document.getElementById('exit-list');
    const printReportButton = document.getElementById('print-report');
    const reportTimestamp = document.getElementById('report-timestamp');

    let transactions = [];
    let currentEditIndex = -1;

    transactionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const description = descriptionInput.value;
        const type = typeInput.value;
        const date = dateInput.value;
        const amount = parseFloat(amountInput.value);

        const transaction = {
            description,
            type,
            date: formatDate(date),
            amount: type === 'Saída' ? -amount : amount
        };

        if (currentEditIndex === -1) {
            transactions.push(transaction);
        } else {
            transactions[currentEditIndex] = transaction;
            currentEditIndex = -1;
        }

        transactions.sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
        updateUI();

        descriptionInput.value = '';
        dateInput.value = '';
        amountInput.value = '';
    });

    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    function updateUI() {
        transactionList.innerHTML = '';
        let balance = 0;

        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.date} - ${transaction.description} - ${transaction.type}: R$ ${transaction.amount.toFixed(2)}
                <div class="transaction-buttons">
                    <button class="edit-btn" data-index="${index}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            transactionList.appendChild(li);

            balance += transaction.amount;
        });

        balanceSpan.textContent = `R$ ${balance.toFixed(2)}`;
        if (balance >= 0) {
            balanceSpan.className = 'positive';
            balanceStatus.className = 'positive';
            balanceStatus.textContent = 'Positivo';
        } else {
            balanceSpan.className = 'negative';
            balanceStatus.className = 'negative';
            balanceStatus.textContent = 'Negativo';
        }

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditTransaction);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteTransaction);
        });
    }

    function handleEditTransaction(event) {
        const index = event.target.closest('button').dataset.index;
        const transaction = transactions[index];

        descriptionInput.value = transaction.description;
        typeInput.value = transaction.type;
        dateInput.value = transaction.date.split('/').reverse().join('-');
        amountInput.value = Math.abs(transaction.amount).toFixed(2);

        currentEditIndex = index;
    }

    function handleDeleteTransaction(event) {
        const index = event.target.closest('button').dataset.index;
        transactions.splice(index, 1);
        updateUI();
    }

    generateReportButton.addEventListener('click', function() {
        entryList.innerHTML = '';
        exitList.innerHTML = '';

        const entries = transactions.filter(t => t.type === 'Entrada');
        const exits = transactions.filter(t => t.type === 'Saída');

        entries.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.date} - ${entry.description}: R$ ${entry.amount.toFixed(2)}`;
            entryList.appendChild(li);
        });

        exits.forEach(exit => {
            const li = document.createElement('li');
            li.textContent = `${exit.date} - ${exit.description}: R$ ${exit.amount.toFixed(2)}`;
            exitList.appendChild(li);
        });

        const now = new Date();
        reportTimestamp.textContent = `Relatório gerado em: ${formatDateTime(now)}`;

        reportDiv.classList.remove('hidden');
    });

    function formatDateTime(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    }

    printReportButton.addEventListener('click', function() {
        const originalContent = document.body.innerHTML;
        const reportContent = `
            <div class="balance-container">
                <h2>Saldo Atual: ${balanceSpan.textContent}</h2>
                <h3 class="${balanceStatus.className}">${balanceStatus.textContent}</h3>
            </div>
            <div class="report-section">
                <h3>Entradas</h3>
                <ul id="entry-list">${entryList.innerHTML}</ul>
            </div>
            <div class="report-section">
                <h3>Saídas</h3>
                <ul id="exit-list">${exitList.innerHTML}</ul>
            </div>
            <p>${reportTimestamp.textContent}</p>
        `;
        document.body.innerHTML = reportContent;
        window.print();
        document.body.innerHTML = originalContent;
        location.reload();
    });
});
