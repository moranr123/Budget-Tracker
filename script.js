const description = document.getElementById("titleDescription");
const amountInput = document.getElementById("amount");
const submitBtn = document.getElementById("submitBtn");
const type = document.getElementById("type");
const transactionsList = document.getElementById("listOfTransactions");

const income = document.getElementById("totalIncome");
const expenses = document.getElementById("totalExpenses");
const totalBalance = document.getElementById("totalBalance");
const transactionCount = document.getElementById("transactionCount");

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

//  Load data from localStorage or use empty array
let savedData = JSON.parse(localStorage.getItem("transactions")) || [];

let totalIncome = 0;
let totalExpenses = 0;
let Balance = 0;

function updateTransactionCount() {
  transactionCount.textContent = savedData.length;
}

function hideEmptyState() {
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function showEmptyState() {
  if (savedData.length === 0) {
    const existingEmptyState = document.querySelector('.empty-state');
    if (!existingEmptyState) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <i class="fas fa-receipt"></i>
        <h4>No transactions yet</h4>
        <p>Add your first transaction to get started!</p>
      `;
      transactionsList.appendChild(emptyState);
    } else {
      existingEmptyState.style.display = 'block';
    }
  }
}

function renderSavedData() {
  transactionsList.innerHTML = '';
  totalIncome = 0;
  totalExpenses = 0;

  if (savedData.length === 0) {
    showEmptyState();
    updateTransactionCount();
    updateDisplay();
    return;
  }

  hideEmptyState();

  savedData.forEach((item) => {
    createTransactionElement(item);
    if (item.type === "income") {
      totalIncome += parseInt(item.amount);
    } else {
      totalExpenses += parseInt(item.amount);
    }
  });

  updateDisplay();
  updateTransactionCount();
}

function createTransactionElement(item) {
  const itemBox = document.createElement("div");
  itemBox.classList.add("transactionStyle");

  const transactionInfo = document.createElement("div");
  transactionInfo.classList.add("transaction-info");

  const transactionIcon = document.createElement("div");
  transactionIcon.classList.add("transaction-icon", item.type);
  transactionIcon.innerHTML = item.type === "income" ?
    '<i class="fas fa-arrow-up"></i>' :
    '<i class="fas fa-arrow-down"></i>';

  const transactionDetails = document.createElement("div");
  transactionDetails.classList.add("transaction-details");

  const descriptionElement = document.createElement("h4");
  descriptionElement.innerText = item.title;

  const date = new Date(item.date);
  const dateElement = document.createElement("p");
  dateElement.innerText = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  transactionDetails.appendChild(descriptionElement);
  transactionDetails.appendChild(dateElement);

  const transactionAmount = document.createElement("div");
  transactionAmount.classList.add("transaction-amount");

  const amountElement = document.createElement("span");
  amountElement.classList.add("amount", item.type);
  amountElement.innerText = "₱" + parseInt(item.amount).toLocaleString();

  transactionAmount.appendChild(amountElement);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';

  deleteBtn.addEventListener("click", () => {
    itemBox.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      transactionsList.removeChild(itemBox);
      savedData = savedData.filter((data) => data.id !== item.id);

      //  Save updated data
      localStorage.setItem("transactions", JSON.stringify(savedData));

      recalculateTotals();
      updateTransactionCount();
      if (savedData.length === 0) {
        showEmptyState();
      }
    }, 300);
  });

  transactionInfo.appendChild(transactionIcon);
  transactionInfo.appendChild(transactionDetails);

  itemBox.appendChild(transactionInfo);
  itemBox.appendChild(transactionAmount);
  itemBox.appendChild(deleteBtn);

  transactionsList.appendChild(itemBox);
}

function updateDisplay() {
  income.innerText = "₱" + totalIncome.toLocaleString();
  expenses.innerText = "₱" + totalExpenses.toLocaleString();
  const balance = totalIncome - totalExpenses;
  totalBalance.innerText = "₱" + balance.toLocaleString();

  const balanceCard = document.querySelector('.balance-card');
  if (balance >= 0) {
    balanceCard.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
  } else {
    balanceCard.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
  }
}

submitBtn.addEventListener("click", function () {
  addInputs();
});

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && (description === document.activeElement ||
    amountInput === document.activeElement || type === document.activeElement)) {
    addInputs();
  }
});

const reset = () => {
  description.value = "";
  amountInput.value = "";
  type.value = "";
};

function addInputs() {
  if (type.value == "" || description.value.trim() == "" || amountInput.value.trim() == "") {
    showNotification("Please fill all fields", "error");
    return;
  }

  if (parseFloat(amountInput.value) <= 0) {
    showNotification("Amount must be greater than 0", "error");
    return;
  }

  const amount = parseInt(amountInput.value);

  if (type.value === "income") {
    totalIncome += amount;
  } else {
    totalExpenses += amount;
  }

  Balance = totalIncome - totalExpenses;

  const now = new Date();
  const uniqueId = Date.now();

  const newTransaction = {
    id: uniqueId,
    title: description.value,
    amount: amountInput.value,
    type: type.value,
    date: now,
  };

  savedData.push(newTransaction);

  //  Save to localStorage
  localStorage.setItem("transactions", JSON.stringify(savedData));

  hideEmptyState();
  createTransactionElement(newTransaction);
  updateDisplay();
  updateTransactionCount();
  showNotification("Transaction added successfully!", "success");
  reset();
}

function recalculateTotals() {
  totalIncome = 0;
  totalExpenses = 0;

  savedData.forEach((item) => {
    if (item.type === "income") {
      totalIncome += parseInt(item.amount);
    } else {
      totalExpenses += parseInt(item.amount);
    }
  });

  updateDisplay();
}

function showNotification(message, type) {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideInRight 0.3s ease-out;
    background: ${type === 'success' ?
      'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' :
      'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'};
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
    }
  }
`;
document.head.appendChild(style);

//  Initial render from localStorage
renderSavedData();
