const taskListElement = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const tagInput = document.getElementById('tagInput');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let taskToDelete = null;
let draggedTaskIndex = null;

function renderTasks() {
  taskListElement.innerHTML = '';
  let tasks = [];

  if (currentListType === 'default') {
    for (const list in lists) {
      tasks = tasks.concat(lists[list]);
    }
    if (currentList === 'today') {
      const today = new Date().toISOString().split('T')[0];
      tasks = tasks.filter(t => t.deadline === today && !t.completed);
    }
    if (currentList === 'important') {
      tasks = tasks.filter(t => t.important && !t.completed);
    }
    if (currentList === 'completed') {
      tasks = tasks.filter(t => t.completed);
    }
  } else if (currentListType === 'custom') {
    tasks = lists[currentList] || [];
  }

  const sortType = document.getElementById('sortSelect')?.value || 'none';
  const showIncompleteOnly = document.getElementById('incompleteOnly')?.checked;

  if (sortType === 'alphabet') {
    tasks.sort((a, b) => (a.text || "").localeCompare(b.text || ""));
  } else if (sortType === 'addedDate') {
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortType === 'deadline') {
    tasks.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  } else if (sortType === 'important') {
    tasks.sort((a, b) => {
      if (a.important !== b.important) return b.important - a.important;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  } else if (sortType === 'tag') {
    tasks.sort((a, b) => (a.tag || "").localeCompare(b.tag || ""));
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(currentSearchText);
    const matchesCompletion = !showIncompleteOnly || !task.completed;
    return matchesSearch && matchesCompletion;
  });

  filteredTasks.forEach((task, index) => {
    setTimeout(() => createTaskElement(task, index), index * 100);
  });

  updateProgress(filteredTasks);
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.classList.add('task-appear');
  if (task.completed) li.classList.add('completed');

  setTimeout(() => {
    li.classList.add('show');
  }, 50);

  li.setAttribute('draggable', true);

  li.addEventListener('dragstart', () => {
    draggedTaskIndex = index;
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    li.classList.add('drag-over');
  });

  li.addEventListener('dragleave', () => {
    li.classList.remove('drag-over');
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    li.classList.remove('drag-over');

    const allTasks = getCurrentTasks();
    const droppedIndex = Array.from(taskListElement.children).indexOf(li);

    if (draggedTaskIndex !== null && droppedIndex !== null && draggedTaskIndex !== droppedIndex) {
      const movedTask = allTasks.splice(draggedTaskIndex, 1)[0];
      allTasks.splice(droppedIndex, 0, movedTask);
      save();
      renderTasks();
    }
  });

  const topDiv = document.createElement('div');
  topDiv.className = 'task-top';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.onclick = (e) => {
    e.stopPropagation();
    task.completed = checkbox.checked;
    li.classList.add('task-disappear');
    setTimeout(() => {
      save();
      renderTasks();
    }, 400);
  };

  const taskText = document.createElement('input');
  taskText.type = 'text';
  taskText.className = 'task-text';
  taskText.value = task.text;
  taskText.disabled = true;

  if (task.completed) {
    taskText.classList.add('completed');
  }
  const today = new Date().toISOString().split('T')[0];
  if (!task.completed && task.deadline && task.deadline <= today) {
    taskText.classList.add('urgent');
  } else if (!task.completed && task.important) {
    taskText.classList.add('important');
  }

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'task-buttons';

  const editBtn = document.createElement('button');
  editBtn.innerHTML = '🖊️';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    taskText.disabled = false;
    taskText.classList.add('editing');
    taskText.focus();
  };

  taskText.addEventListener('blur', () => finishEditing(task, taskText));
  taskText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') taskText.blur();
  });

  const calendarBtn = document.createElement('button');
  calendarBtn.innerHTML = '📆';
  calendarBtn.onclick = (e) => {
    e.stopPropagation();
    showCalendar(task, li);
  };

  const starBtn = document.createElement('button');
  starBtn.innerHTML = task.important ? '⭐' : '☆';
  starBtn.onclick = (e) => {
    e.stopPropagation();
    task.important = !task.important;
    save();
    renderTasks();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    taskToDelete = { task, li };
    confirmModal.style.display = 'flex';
  };

  buttonsDiv.appendChild(editBtn);
  buttonsDiv.appendChild(calendarBtn);
  buttonsDiv.appendChild(starBtn);
  buttonsDiv.appendChild(deleteBtn);

  topDiv.appendChild(checkbox);
  topDiv.appendChild(taskText);
  topDiv.appendChild(buttonsDiv);

  li.appendChild(topDiv);

  if (task.deadline) {
    const dateSpan = document.createElement('div');
    dateSpan.className = 'task-date';
    dateSpan.textContent = `До: ${task.deadline}`;
    li.appendChild(dateSpan);
  }

  if (task.tag) {
    const tagSpan = document.createElement('div');
    tagSpan.className = 'task-tag';
    tagSpan.textContent = `#${task.tag}`;
    li.appendChild(tagSpan);
  }

  taskListElement.appendChild(li);
}

function addTask() {
    const text = taskInput.value.trim();
    const deadline = deadlineInput.value || null;
    const tag = tagInput?.value || "";
  
    if (!text || !currentList) return;
  
    const newTask = {
      text,
      completed: false,
      important: false,
      deadline: deadline,
      createdAt: new Date().toISOString(),
      tag: tag
    };
  
    lists[currentList].push(newTask);
    taskInput.value = '';
    deadlineInput.value = '';
    if (tagInput) tagInput.value = '';
  
    save();
    renderTasks();
    renderCustomLists(); // <-- ДОДАЛИ ОНОВЛЕННЯ СПИСКІВ!
  }

function updateProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');

  if (progressText) {
    progressText.textContent = `Виконано: ${completed} із ${total}`;
  }

  if (progressBar) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
  }
}

function getCurrentTasks() {
  if (currentListType === 'custom') {
    return lists[currentList];
  } else {
    const allTasks = [];
    for (const list in lists) {
      allTasks.push(...lists[list]);
    }
    return allTasks;
  }
}

// Підтвердження видалення
confirmYes.addEventListener('click', () => {
  if (taskToDelete && currentListType === 'custom') {
    taskToDelete.li.classList.add('task-disappear');
    setTimeout(() => {
        lists[currentList] = lists[currentList].filter(t => t !== taskToDelete.task);
        save();
        renderTasks();
        renderCustomLists(); // Додаємо ОНОВЛЕННЯ списків
        confirmModal.style.display = 'none';
        taskToDelete = null;
    }, 400);
  }
});

confirmNo.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  taskToDelete = null;
});
