// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Navigation and Theme
  const themeToggle = document.querySelector('.theme-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Hero Section
  const typewriterElement = document.getElementById('typewriter');
  const ctaButton = document.querySelector('.cta-button');
  
  // Splitter Section
  const addPersonBtn = document.getElementById('add-person-btn');
  const personNameInput = document.getElementById('person-name');
  const peopleList = document.getElementById('people-list');
  const expenseName = document.getElementById('expense-name');
  const expenseAmount = document.getElementById('expense-amount');
  const expenseDate = document.getElementById('expense-date');
  const expensePayer = document.getElementById('expense-payer');
  const splitBtns = document.querySelectorAll('.split-btn');
  const splitConfig = document.getElementById('split-config');
  const calculateBtn = document.getElementById('calculate-btn');
  const resultsDiv = document.getElementById('results');
  const saveExpenseBtn = document.getElementById('save-expense');
  
  // History Section
  const searchHistory = document.getElementById('search-history');
  const filterHistory = document.getElementById('filter-history');
  const historyContainer = document.getElementById('history-container');
  
  // Global State
  const state = {
    people: [],
    selectedSplitMethod: 'equal',
    expenses: [],
    currentExpenseResults: null,
    darkMode: localStorage.getItem('darkMode') === 'true'
  };

  // Set initial date to today
  const today = new Date().toISOString().split('T')[0];
  expenseDate.value = today;

  // Initialize the app
  init();

  // Initialize the application
  function init() {
    // Load saved data from localStorage
    loadSavedData();
    
    // Apply dark mode if previously set
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Start typewriter effect
    typewriterEffect();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup split method configuration
    updateSplitMethodUI();
    
    // Update UI elements
    updatePeopleUI();
    updateHistoryUI();
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavClick);
    });
    
    // CTA button
    ctaButton.addEventListener('click', () => {
      document.getElementById('splitter').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Add person button
    addPersonBtn.addEventListener('click', addPerson);
    personNameInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') addPerson();
    });
    
    // Split method buttons
    splitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedSplitMethod = btn.dataset.method;
        updateSplitMethodUI();
      });
    });
    
    // Calculate button
    calculateBtn.addEventListener('click', calculateSplit);
    
    // Save expense button
    saveExpenseBtn.addEventListener('click', saveExpense);
    
    // Search and filter
    searchHistory.addEventListener('input', updateHistoryUI);
    filterHistory.addEventListener('change', updateHistoryUI);
  }

  // Load saved data from localStorage
  function loadSavedData() {
    try {
      const savedPeople = localStorage.getItem('splitwise_people');
      const savedExpenses = localStorage.getItem('splitwise_expenses');
      
      if (savedPeople) {
        state.people = JSON.parse(savedPeople);
      }
      
      if (savedExpenses) {
        state.expenses = JSON.parse(savedExpenses);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  // Save data to localStorage
  function saveData() {
    try {
      localStorage.setItem('splitwise_people', JSON.stringify(state.people));
      localStorage.setItem('splitwise_expenses', JSON.stringify(state.expenses));
      localStorage.setItem('darkMode', state.darkMode);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    state.darkMode = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = state.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    saveData();
  }

  // Handle navigation link clicks
  function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    
    navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
  }

  // Typewriter effect for the hero section
  function typewriterEffect() {
    const phrases = [
      'For roommates',
      'For travel groups',
      'For friends',
      'For couples',
      'For family'
    ];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50;
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 100;
      }
      
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1000; // Pause at end of phrase
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typingSpeed = 300; // Pause before starting new phrase
      }
      
      setTimeout(type, typingSpeed);
    }
    
    type();
  }

  // Add a person to the expense
  function addPerson() {
    const name = personNameInput.value.trim();
    
    if (name && !state.people.includes(name)) {
      state.people.push(name);
      personNameInput.value = '';
      updatePeopleUI();
      saveData();
    } else if (state.people.includes(name)) {
      showNotification('This person is already added!');
    }
  }

  // Remove a person from the expense
  function removePerson(name) {
    state.people = state.people.filter(person => person !== name);
    updatePeopleUI();
    saveData();
  }

  // Update the people list UI
  function updatePeopleUI() {
    peopleList.innerHTML = '';
    expensePayer.innerHTML = '<option value="" disabled selected>Select person</option>';
    
    if (state.people.length === 0) {
      peopleList.innerHTML = '<p class="no-results">Add people to split the expense between.</p>';
    } else {
      state.people.forEach(person => {
        // Add to people list
        const personEl = document.createElement('div');
        personEl.classList.add('person-item');
        personEl.innerHTML = `
          <span>${person}</span>
          <button class="remove-person" data-name="${person}">
            <i class="fas fa-times"></i>
          </button>
        `;
        peopleList.appendChild(personEl);
        
        // Add to payer dropdown
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        expensePayer.appendChild(option);
      });
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-person').forEach(btn => {
        btn.addEventListener('click', () => {
          removePerson(btn.dataset.name);
        });
      });
    }
    
    updateSplitMethodUI();
  }

  // Update the split method UI
  function updateSplitMethodUI() {
    // Update active button
    splitBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === state.selectedSplitMethod);
    });
    
    // Update split configuration
    splitConfig.innerHTML = '';
    
    if (state.people.length === 0) {
      splitConfig.innerHTML = '<p class="no-results">Add people to configure splitting.</p>';
      return;
    }
    
    switch (state.selectedSplitMethod) {
      case 'equal':
        splitConfig.innerHTML = `
          <div class="equal-split active-split">
            <p>The expense will be split equally among ${state.people.length} people.</p>
          </div>
        `;
        break;
        
      case 'percentage':
        const percentageSplit = document.createElement('div');
        percentageSplit.classList.add('percentage-split', 'active-split');
        
        let percentageHtml = '<p class="mb-2">Set percentage for each person (total must equal 100%):</p>';
        
        state.people.forEach(person => {
          percentageHtml += `
            <div class="percentage-item">
              <label for="percentage-${person}">${person}</label>
              <input type="number" id="percentage-${person}" class="percentage-input" 
                     data-person="${person}" value="${Math.round(100 / state.people.length)}" 
                     min="0" max="100">
              <span>%</span>
            </div>
          `;
        });
        
        percentageSplit.innerHTML = percentageHtml;
        splitConfig.appendChild(percentageSplit);
        
        // Add input event to adjust percentages
        document.querySelectorAll('.percentage-input').forEach(input => {
          input.addEventListener('input', validatePercentages);
        });
        break;
        
      case 'custom':
        const customSplit = document.createElement('div');
        customSplit.classList.add('custom-split', 'active-split');
        
        let customHtml = '<p class="mb-2">Set specific amount for each person:</p>';
        
        state.people.forEach(person => {
          customHtml += `
            <div class="custom-item">
              <label for="custom-${person}">${person}</label>
              <input type="number" id="custom-${person}" class="custom-input" 
                     data-person="${person}" value="0" min="0" step="0.01">
              <span>$</span>
            </div>
          `;
        });
        
        customSplit.innerHTML = customHtml;
        splitConfig.appendChild(customSplit);
        
        // Add input event to validate custom amounts
        document.querySelectorAll('.custom-input').forEach(input => {
          input.addEventListener('input', validateCustomAmounts);
        });
        break;
    }
  }

  // Validate percentage inputs to ensure they sum to 100%
  function validatePercentages() {
    const inputs = document.querySelectorAll('.percentage-input');
    let total = 0;
    
    inputs.forEach(input => {
      total += Number(input.value) || 0;
    });
    
    inputs.forEach(input => {
      if (total > 100) {
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });
  }

  // Validate custom amount inputs
  function validateCustomAmounts() {
    const inputs = document.querySelectorAll('.custom-input');
    let total = 0;
    
    inputs.forEach(input => {
      total += Number(input.value) || 0;
    });
    
    const expenseTotal = Number(expenseAmount.value) || 0;
    
    inputs.forEach(input => {
      if (total > expenseTotal) {
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });
  }

  // Calculate the expense split
  function calculateSplit() {
    // Validate inputs
    if (!validateExpenseForm()) {
      return;
    }
    
    const amount = Number(expenseAmount.value);
    const results = [];
    
    // Calculate based on split method
    switch (state.selectedSplitMethod) {
      case 'equal':
        const equalShare = amount / state.people.length;
        state.people.forEach(person => {
          results.push({
            name: person,
            amount: equalShare
          });
        });
        break;
        
      case 'percentage':
        const percentageInputs = document.querySelectorAll('.percentage-input');
        let totalPercentage = 0;
        
        percentageInputs.forEach(input => {
          totalPercentage += Number(input.value) || 0;
        });
        
        if (totalPercentage !== 100) {
          showNotification('Percentages must sum to 100%!');
          return;
        }
        
        percentageInputs.forEach(input => {
          const personName = input.dataset.person;
          const percentage = Number(input.value);
          results.push({
            name: personName,
            amount: (percentage / 100) * amount
          });
        });
        break;
        
      case 'custom':
        const customInputs = document.querySelectorAll('.custom-input');
        let totalCustom = 0;
        
        customInputs.forEach(input => {
          totalCustom += Number(input.value) || 0;
        });
        
        if (totalCustom !== amount) {
          showNotification(`Custom amounts must sum to $${amount.toFixed(2)}!`);
          return;
        }
        
        customInputs.forEach(input => {
          const personName = input.dataset.person;
          const customAmount = Number(input.value);
          results.push({
            name: personName,
            amount: customAmount
          });
        });
        break;
    }
    
    // Store current results
    state.currentExpenseResults = {
      name: expenseName.value,
      amount: amount,
      date: expenseDate.value,
      payer: expensePayer.value,
      splitMethod: state.selectedSplitMethod,
      splits: results
    };
    
    // Update results UI
    displayResults(results);
  }

  // Validate the expense form
  function validateExpenseForm() {
    if (!expenseName.value.trim()) {
      showNotification('Please enter an expense name!');
      return false;
    }
    
    if (!expenseAmount.value || Number(expenseAmount.value) <= 0) {
      showNotification('Please enter a valid amount!');
      return false;
    }
    
    if (!expenseDate.value) {
      showNotification('Please select a date!');
      return false;
    }
    
    if (!expensePayer.value) {
      showNotification('Please select who paid!');
      return false;
    }
    
    if (state.people.length < 2) {
      showNotification('Please add at least 2 people!');
      return false;
    }
    
    return true;
  }

  // Display the calculation results
  function displayResults(results) {
    resultsDiv.innerHTML = '';
    
    results.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('result-item');
      resultItem.innerHTML = `
        <span class="result-name">${result.name}</span>
        <span class="result-amount">$${result.amount.toFixed(2)}</span>
      `;
      resultsDiv.appendChild(resultItem);
    });
    
    // Show animation
    resultsDiv.classList.add('slide-in-left');
    setTimeout(() => {
      resultsDiv.classList.remove('slide-in-left');
    }, 500);
    
    // Show save button
    saveExpenseBtn.classList.add('pulse');
  }

  // Save the current expense to history
  function saveExpense() {
    if (!state.currentExpenseResults) {
      showNotification('Calculate an expense first!');
      return;
    }
    
    // Add unique ID and timestamp
    const expense = {
      ...state.currentExpenseResults,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    // Add to expenses array
    state.expenses.unshift(expense);
    
    // Save to localStorage
    saveData();
    
    // Update UI
    updateHistoryUI();
    
    // Clear form
    resetExpenseForm();
    
    // Show notification
    showNotification('Expense saved successfully!');
  }

  // Reset the expense form
  function resetExpenseForm() {
    expenseName.value = '';
    expenseAmount.value = '';
    expenseDate.value = today;
    expensePayer.selectedIndex = 0;
    state.currentExpenseResults = null;
    resultsDiv.innerHTML = '<p class="no-results">Enter expense details and calculate to see results.</p>';
    saveExpenseBtn.classList.remove('pulse');
  }

  // Update the history UI
  function updateHistoryUI() {
    historyContainer.innerHTML = '';
    
    let filteredExpenses = [...state.expenses];
    
    // Apply search filter
    const searchTerm = searchHistory.value.toLowerCase().trim();
    if (searchTerm) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.name.toLowerCase().includes(searchTerm) ||
        expense.payer.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sort filter
    switch (filterHistory.value) {
      case 'recent':
        // Already sorted by default (newest first)
        break;
      case 'oldest':
        filteredExpenses.reverse();
        break;
      case 'highest':
        filteredExpenses.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        filteredExpenses.sort((a, b) => a.amount - b.amount);
        break;
    }
    
    if (filteredExpenses.length === 0) {
      historyContainer.innerHTML = '<p class="no-history">No expense history found.</p>';
      return;
    }
    
    filteredExpenses.forEach(expense => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      historyItem.dataset.id = expense.id;
      
      const date = new Date(expense.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      historyItem.innerHTML = `
        <div class="history-info">
          <div class="history-title">${expense.name}</div>
          <div class="history-meta">
            <span><i class="fas fa-calendar"></i> ${date}</span>
            <span><i class="fas fa-user"></i> Paid by ${expense.payer}</span>
            <span><i class="fas fa-users"></i> Split ${expense.splitMethod}</span>
          </div>
        </div>
        <div class="history-amount">
          $${expense.amount.toFixed(2)}
        </div>
        <div class="history-actions">
          <button class="view-details" data-id="${expense.id}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="delete-expense" data-id="${expense.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      historyContainer.appendChild(historyItem);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', () => viewExpenseDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
    });
  }

  // View expense details
  function viewExpenseDetails(id) {
    const expense = state.expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Create a modal for expense details
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    const date = new Date(expense.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${expense.name} Details</h3>
          <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="expense-details">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Total Amount:</strong> $${expense.amount.toFixed(2)}</p>
            <p><strong>Paid By:</strong> ${expense.payer}</p>
            <p><strong>Split Method:</strong> ${expense.splitMethod}</p>
          </div>
          <div class="expense-splits">
            <h4>Split Details</h4>
            <div class="splits-list">
              ${expense.splits.map(split => `
                <div class="split-item">
                  <span>${split.name}</span>
                  <span>$${split.amount.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener to close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close when clicking outside the modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .modal-content {
        background-color: var(--background);
        border-radius: var(--radius);
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 25px var(--shadow);
        animation: fadeIn 0.3s;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
      }
      
      .modal-header h3 {
        margin: 0;
      }
      
      .close-modal {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-dark);
        opacity: 0.7;
      }
      
      .close-modal:hover {
        opacity: 1;
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      .expense-details p {
        margin-bottom: 0.75rem;
      }
      
      .expense-splits h4 {
        margin: 1.5rem 0 1rem;
      }
      
      .split-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border);
      }
      
      .split-item:last-child {
        border-bottom: none;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Delete an expense
  function deleteExpense(id) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    state.expenses = state.expenses.filter(exp => exp.id !== id);
    saveData();
    updateHistoryUI();
    showNotification('Expense deleted!');
  }

  // Show notification
  function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector('.notification');
    if (notification) {
      document.body.removeChild(notification);
    }
    
    // Create notification element
    notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--primary);
        color: var(--text-light);
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s forwards, fadeOut 0.3s 2.7s forwards;
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
});


const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2 + 1;
    this.dx = Math.random() * 1 - 0.5;
    this.dy = Math.random() * 1 - 0.5;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.fill();
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0 || this.x > canvas.width) this.dx = -this.dx;
    if (this.y < 0 || this.y > canvas.height) this.dy = -this.dy;

    this.draw();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => p.update());
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
