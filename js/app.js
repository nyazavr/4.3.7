
let input=document.querySelector('#autocomplete');
function ciSearch(what = '', where = '') {
  return where.toUpperCase().search(what.toUpperCase());
}
input.classList.add('autocomplete-input');
let wrap = document.createElement('div');
wrap.className = 'autocomplete-wrap';
input.parentNode.insertBefore(wrap, input);
wrap.appendChild(input);

let list = document.createElement('div');
list.className = 'autocomplete-list';
wrap.appendChild(list);

let listItems = [];
let focusedItem = -1;

function setActive(active = true) {
  if(active)
    wrap.classList.add('active');
  else
    wrap.classList.remove('active');
}

function focusItem(index) {
  if(!listItems.length) return false;
  if(index > listItems.length - 1) return focusItem(0);
  if(index < 0) return focusItem(listItems.length - 1);
  focusedItem = index;
  unfocusAllItems();
  listItems[focusedItem].classList.add('focused');
}
function unfocusAllItems() {
  listItems.forEach(item => {
    item.classList.remove('focused');
  });
}

let resultItem=document.querySelector('.result-repo__list-repo')

function selectItem(item) {
  if(!item.name) return false;
  input.value = "";
  let resultItemLi=document.createElement('li');
  let resultItemDiv=document.createElement('div');
  let resultItemRemove=document.createElement('div')
  resultItemRemove.classList.add("result-repo__item-remove");
  resultItemDiv.classList.add("result-repo__item");
  resultItemDiv.insertAdjacentHTML('beforeEnd','Name: ' + item.name + '<br>Owner: ' + item.owner.login + '<br>Stars: ' + String(item.stargazers_count))
  resultItemDiv.appendChild(resultItemRemove)
  resultItemLi.appendChild(resultItemDiv)
  resultItemLi.addEventListener('click',function(e){
    if(e.target.className=="result-repo__item-remove"){
      e.currentTarget.remove();
    }
  })
  resultItem.appendChild(resultItemLi)
  setActive(false);
}

const debounce = (fn, debounceTime) => {
  let timeout;
  return function () {
      const fnCall =() => { fn.apply(this, arguments) }
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, debounceTime)
  };
};
let fetchinput = async ()=>{
  list.innerHTML = '';
  listItems = [];
  let value = input.value;
  if(!value) return setActive(false);
  
  let response=await fetch('https://api.github.com/search/repositories?q='+input.value);
  console.log(response)
  if(response.ok){
    let repositories = await response.json()
    console.log(repositories.items.length)
    for(let i=0; i < 5;i++){
      console.log(repositories.items[i])
      let search = ciSearch(value, repositories.items[i].name);
      if(search === -1) return false;
      let item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = repositories.items[i].name;
      list.appendChild(item);
      listItems.push(item);
  
      item.addEventListener('click', function() {
        selectItem(repositories.items[i]);
      });
    }
  }
  if(listItems.length > 0) {
    focusItem(0);
    setActive(true);
  }
  else setActive(false);
}
let fetchD=debounce(fetchinput,400)
input.addEventListener('input',async () => {

  fetchD();

});

input.addEventListener('keydown', e => {

  let keyCode = e.keyCode;

  if(keyCode === 40) { // arrow down
    e.preventDefault();
    focusedItem++;
    focusItem(focusedItem);
  } else if(keyCode === 38) { //arrow up
    e.preventDefault();
    if(focusedItem > 0) focusedItem--;
    focusItem(focusedItem);
  } else if(keyCode === 27) { // escape
    setActive(false);
  } else if(keyCode === 13) { // enter
    selectItem(focusedItem);
  }
  
});

document.body.addEventListener('click', function(e) {
  if(!wrap.contains(e.target)) setActive(false);
});
