let currentList = null;
let currentListType = null;

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const incompleteOnlyCheckbox = document.getElementById('incompleteOnly');

let currentSearchText = '';

listInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCustomList();
});

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

searchInput.addEventListener('input', (e) => {
  currentSearchText = e.target.value.toLowerCase();
  renderTasks();
});

sortSelect.addEventListener('change', renderTasks);

if (incompleteOnlyCheckbox) {
  incompleteOnlyCheckbox.addEventListener('change', renderTasks);
}

renderCustomLists();
renderListHeader();
