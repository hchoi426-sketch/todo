document.addEventListener('DOMContentLoaded', () => {
    // Select Objects
    const todoInput = document.getElementById('todoInput');
    const todoCategory = document.getElementById('todoCategory');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('emptyState');
    const dateDisplay = document.getElementById('dateDisplay');
    const themeToggle = document.getElementById('themeToggle');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // State
    let todos = JSON.parse(localStorage.getItem('premiumTodos')) || [];
    let currentFilter = 'all';
    let isDarkMode = localStorage.getItem('premiumTheme') !== 'light'; // Default to dark

    // Constants
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialization
    function init() {
        renderDate();
        renderTodos();
        setupEventListeners();
        applyTheme();
        updateProgress();
    }

    function applyTheme() {
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('premiumTheme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    }

    function renderDate() {
        const now = new Date();
        const dayName = DAYS[now.getDay()];
        const monthName = MONTHS[now.getMonth()];
        const dateNum = now.getDate();
        dateDisplay.textContent = `${dayName}, ${monthName} ${dateNum}`;
    }

    function setupEventListeners() {
        // Theme Toggle
        themeToggle.addEventListener('click', toggleTheme);

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

        // Drag and Drop (List Level)
        todoList.addEventListener('dragover', initSortableList);
        todoList.addEventListener('dragenter', e => e.preventDefault());
    }

    function addTodo() {
        const text = todoInput.value.trim();
        const category = todoCategory.value;
        if (text === '') return;

        const newTodo = {
            id: Date.now(),
            text: text,
            category: category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos.unshift(newTodo); // Add to top
        saveTodos();
        renderTodos();
        updateProgress();
        todoInput.value = '';

        // Focus back on input
        todoInput.focus();
    }

    function toggleTodo(id) {
        let isCompletedNow = false;
        todos = todos.map(todo => {
            if (todo.id === id) {
                isCompletedNow = !todo.completed;
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
        updateProgress(); // Re-render first to update state

        if (isCompletedNow) {
            triggerConfetti();
        }
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
                updateProgress();
            }, 300);
        } else {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
            updateProgress();
        }
    }

    function updateTodoText(id, newText) {
        todos = todos.map(todo => {
            if (todo.id === id) return { ...todo, text: newText };
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    function updateProgress() {
        if (todos.length === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            return;
        }

        const completedCount = todos.filter(t => t.completed).length;
        const percent = Math.round((completedCount / todos.length) * 100);

        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;

        if (percent === 100 && todos.length > 0) {
            triggerBigConfetti();
        }
    }

    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#a78bfa', '#f472b6', '#60a5fa']
            });
        }
    }

    function triggerBigConfetti() {
        if (typeof confetti === 'function') {
            const duration = 2000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a78bfa', '#f472b6']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#60a5fa', '#34d399']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
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
                li.draggable = true; // Enable drag

                // Category Badge HTML
                const catClass = `cat-${todo.category || 'personal'}`;
                const catName = (todo.category || 'personal').toUpperCase();

                li.innerHTML = `
                    <button class="check-btn" aria-label="Toggle completion">
                        <i class="fas fa-check"></i>
                    </button>
                    <div class="todo-content" style="flex:1; display:flex; align-items:center; overflow:hidden;">
                        <span class="category-badge ${catClass}">${catName}</span>
                        <span class="todo-text">${escapeHtml(todo.text)}</span>
                    </div>
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                // Event Listeners for Item
                const checkBtn = li.querySelector('.check-btn');
                const deleteBtn = li.querySelector('.delete-btn');
                const textSpan = li.querySelector('.todo-text');

                checkBtn.onclick = (e) => { e.stopPropagation(); toggleTodo(todo.id); };
                deleteBtn.onclick = (e) => { e.stopPropagation(); deleteTodo(todo.id); };

                // Edit functionality
                textSpan.ondblclick = (e) => {
                    e.stopPropagation();
                    const currentText = todo.text;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentText;
                    input.className = 'edit-input';

                    input.onblur = () => {
                        const newText = input.value.trim();
                        if (newText) updateTodoText(todo.id, newText);
                        else renderTodos(); // Revert
                    };

                    input.onkeypress = (ev) => {
                        if (ev.key === 'Enter') input.blur();
                    };

                    textSpan.replaceWith(input);
                    input.focus();
                };

                // Drag Events
                li.addEventListener('dragstart', () => {
                    setTimeout(() => li.classList.add('dragging'), 0);
                });
                li.addEventListener('dragend', () => {
                    li.classList.remove('dragging');
                    // Save new order based on DOM
                    updateOrderFromDOM();
                });

                todoList.appendChild(li);
            });
        }
    }

    function initSortableList(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;

        let siblings = [...todoList.querySelectorAll('.todo-item:not(.dragging)')];
        let nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
        });

        todoList.insertBefore(draggingItem, nextSibling);
    }

    function updateOrderFromDOM() {
        const itemIds = [...todoList.querySelectorAll('.todo-item')]
            .map(item => Number(item.dataset.id));

        // Reorder global todos array based on IDs
        const newTodos = [];
        itemIds.forEach(id => {
            const todo = todos.find(t => t.id === id);
            if (todo) newTodos.push(todo);
        });

        // Add any that might be missing (hidden by filter) back to the end?? 
        // Logic constraint: Drag & Drop usually only works well when "All" filter is active or careful implementation needed.
        // For simplicity, we assume "All" filter or reorder only visible ones and keep others.
        // Better: Only reorder if showing ALL.

        if (currentFilter === 'all') {
            todos = newTodos;
            saveTodos();
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
