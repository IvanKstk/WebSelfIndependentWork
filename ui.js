function applyThemeForList(type) {
    const main = document.querySelector('.main');
    const isLight = document.body.classList.contains('light');
  
    main.style.background = '';
    main.style.color = '';
  
    if (type === 'today') {
      main.style.background = isLight
        ? 'linear-gradient(135deg, #e0f7fa, #b2ebf2)'
        : 'linear-gradient(135deg, #004d40, #00695c)';
      main.style.color = isLight ? '#000' : '#e8eaed';
    } else if (type === 'important') {
      main.style.background = isLight
        ? 'linear-gradient(135deg, #fff3e0, #ffe0b2)'
        : 'linear-gradient(135deg, #5d4037, #795548)';
      main.style.color = isLight ? '#000' : '#e8eaed';
    } else if (type === 'completed') {
      main.style.background = isLight
        ? 'linear-gradient(135deg, #f3e5f5, #e1bee7)'
        : 'linear-gradient(135deg, #4a148c, #6a1b9a)';
      main.style.color = isLight ? '#000' : '#e8eaed';
    } else if (type === 'all') {
      main.style.background = isLight
        ? 'linear-gradient(135deg, #eceff1, #cfd8dc)'
        : 'linear-gradient(135deg, #263238, #37474f)';
      main.style.color = isLight ? '#000' : '#e8eaed';
    } else {
      main.style.background = '';
      main.style.color = '';
    }
  }
  
  function renderListHeader() {
    listHeaderContainer.innerHTML = '';
  
    if (currentListType === 'custom') {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'list-header';
  
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'list-title-input';
      titleInput.value = currentList;
      titleInput.disabled = true;
  
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'list-header-buttons';
  
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '🖊️';
      editBtn.onclick = () => {
        titleInput.disabled = false;
        titleInput.focus();
        titleInput.select();
      };
  
      titleInput.addEventListener('blur', () => {
        const newName = titleInput.value.trim();
        if (newName && newName !== currentList && !lists[newName]) {
          lists[newName] = lists[currentList];
          delete lists[currentList];
          currentList = newName;
          save();
          renderCustomLists();
          renderListHeader();
          renderTasks();
        } else {
          titleInput.value = currentList;
        }
        titleInput.disabled = true;
      });
  
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.onclick = () => {
        if (confirm('Видалити список?')) {
          delete lists[currentList];
          save();
          renderCustomLists();
          currentList = null;
          currentListType = null;
          renderListHeader();
          taskListElement.innerHTML = '';
          taskInputContainer.style.display = 'none';
        }
      };
  
      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(deleteBtn);
  
      headerDiv.appendChild(titleInput);
      headerDiv.appendChild(buttonsDiv);
  
      listHeaderContainer.appendChild(headerDiv);
    } else {
      const title = document.createElement('h2');
      title.textContent = {
        'all': 'Усі завдання',
        'today': 'Мій день',
        'important': 'Важливі',
        'completed': 'Виконані'
      }[currentList] || 'Оберіть вкладку';
  
      listHeaderContainer.appendChild(title);
    }
  }
  
  
  function showCalendar(task, taskElement) {
    if (taskElement.querySelector('.date-picker')) return;
  
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'date-picker';
    dateInput.value = task.deadline || '';
  
    dateInput.onchange = () => {
      task.deadline = dateInput.value;
      save();
      renderTasks();
    };
  
    taskElement.appendChild(dateInput);
    dateInput.focus();
  }
  
  // Темна / Світла тема
  const themeToggle = document.getElementById('themeToggle');
  
  function updateThemeToggleText() {
    if (document.body.classList.contains('light')) {
      themeToggle.textContent = '🌙 Темна тема';
    } else {
      themeToggle.textContent = '☀️ Світла тема';
    }
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    updateThemeToggleText();
    applyThemeForList(currentList);
  });
  
  // При старті
  updateThemeToggleText();
  
  // --- Нові модальні функції для редагування / видалення списку ---
  const listModal = document.getElementById('listModal');
  const listModalTitle = document.getElementById('listModalTitle');
  const listModalInput = document.getElementById('listModalInput');
  const listModalConfirm = document.getElementById('listModalConfirm');
  const listModalCancel = document.getElementById('listModalCancel');
  
  let modalAction = null;
  
  function openEditListModal() {
    listModalTitle.textContent = 'Редагувати назву списку';
    listModalInput.style.display = 'block';
    listModalInput.value = currentList;
    modalAction = 'edit';
    listModal.style.display = 'flex';
  }
  
  function openDeleteListModal() {
    listModalTitle.textContent = 'Видалити цей список?';
    listModalInput.style.display = 'none';
    modalAction = 'delete';
    listModal.style.display = 'flex';
  }
  
  listModalConfirm.addEventListener('click', () => {
    if (modalAction === 'edit') {
      const newName = listModalInput.value.trim();
      if (newName && !lists[newName]) {
        lists[newName] = lists[currentList];
        delete lists[currentList];
        currentList = newName;
        save();
        renderCustomLists();
        renderListHeader();
        renderTasks();
      }
    } else if (modalAction === 'delete') {
      delete lists[currentList];
      save();
      renderCustomLists();
      currentList = null;
      currentListType = null;
      renderListHeader();
      taskListElement.innerHTML = '';
      taskInputContainer.style.display = 'none';
    }
    listModal.style.display = 'none';
  });
  
  listModalCancel.addEventListener('click', () => {
    listModal.style.display = 'none';
  });
  