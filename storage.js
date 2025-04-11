// Збереження списків у localStorage
function save() {
    localStorage.setItem('todoLists', JSON.stringify(lists));
  }
  
  // Завантаження списків із localStorage
  let lists = JSON.parse(localStorage.getItem('todoLists')) || {};
  