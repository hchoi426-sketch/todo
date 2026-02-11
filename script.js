document.addEventListener('DOMContentLoaded', () => {
    // Select Objects
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('emptyState');
    const dateDisplay = document.getElementById('dateDisplay');

    // State
    let todos = JSON.parse(localStorage.getItem('premiumTodos')) || [];
    let currentFilter = 'all';

    // Constants
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialization
    function init() {
        renderDate();
        renderTodos();
        setupEventListeners();
    }

    function renderDate() {
        const now = new Date();
        const dayName = DAYS[now.getDay()];
        const monthName = MONTHS[now.getMonth()];
        const dateNum = now.getDate();
        dateDisplay.textContent = `${dayName}, ${monthName} ${dateNum}`;
    }

    function setupEventListeners() {
        // Add Task
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });

        // Filters
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update UI
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update State
                currentFilter = btn.dataset.filter;
                renderTodos();
            });
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos.unshift(newTodo); // Add to top
        saveTodos();
        renderTodos();
        todoInput.value = '';
        
        // Focus back on input
        todoInput.focus();
    }

    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    function deleteTodo(id) {
        // Animate deletion first
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                renderTodos();
            }, 300);
        } else {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
    }

    function saveTodos() {
        localStorage.setItem('premiumTodos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.dataset.id = todo.id;
                
                li.innerHTML = `
                    <button class="check-btn" aria-label="Toggle completion">
                        <i class="fas fa-check"></i>
                    </button>
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                // Event delegation for this item
                const checkBtn = li.querySelector('.check-btn');
                const deleteBtn = li.querySelector('.delete-btn');
                const textSpan = li.querySelector('.todo-text');

                checkBtn.onclick = (e) => {
                    e.stopPropagation();
                    toggleTodo(todo.id);
                };

                textSpan.onclick = () => {
                    toggleTodo(todo.id);
                };

                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                };

                todoList.appendChild(li);
            });
        }
    }

    // Utility to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Run
    init();
});
