const defaultListsElement = document.getElementById('defaultLists');
const customListsElement = document.getElementById('customLists');
const listHeaderContainer = document.getElementById('listHeaderContainer');

function renderCustomLists() {
    customListsElement.innerHTML = '';
    for (const listName in lists) {
      const li = document.createElement('li');
      const taskCount = lists[listName].length;
  
      li.innerHTML = `${listName} <span class="task-count">(${taskCount})</span>`;
      li.onclick = () => selectCustomList(listName);
  
      customListsElement.appendChild(li);
    }
  }

function addCustomList() {
  const name = listInput.value.trim();
  if (!name || lists[name]) return;
  lists[name] = [];
  listInput.value = '';
  renderCustomLists();
  save();
}

function selectCustomList(name) {
    currentList = name;
    currentListType = 'custom';
    taskInputContainer.style.display = 'flex';
    renderListHeader();
    renderTasks();
    updateMainBackground(''); // При кастомних списках фону фіксованого немає
  }

  function updateMainBackground(type) {
    const main = document.querySelector('.main');
    main.classList.remove('all', 'today', 'important', 'completed', 'light-theme', 'dark-theme');
  
    if (['all', 'today', 'important', 'completed'].includes(type)) {
      main.classList.add(type);
    }
  
    // Логіка кольору тексту
    if (type === 'today' || type === 'completed') {
      main.classList.add('light-theme'); // Світлий фон ➔ темний текст
    } else {
      main.classList.add('dark-theme'); // Темний фон ➔ світлий текст
    }
  }
  

  function selectDefaultList(type) {
    currentList = type;
    currentListType = 'default';
    taskInputContainer.style.display = 'none'; // залишаємо також, щоб поле для введення не було видно
    applyThemeForList(type); // Додаємо нове
    renderListHeader();
    renderTasks();
  }
