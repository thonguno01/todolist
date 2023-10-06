
const nameStore = 'todoListWithJs';
var data = (localStorage.getItem(nameStore) == null) ? [] : JSON.parse(localStorage.getItem(nameStore))
console.log(data);
let dataFilter = checkRoute(data);
var isToggleAll = dataFilter.every(element => element.status === true);
render(dataFilter);


document.getElementById('createtodo').addEventListener("keyup", (e) => {
    var code = e.keyCode ? e.keyCode : e.which;
    let input = document.querySelector('#createtodo').value;
    if (code == 13 && input != "") {
        create(input)
    }
    return false;
});
// 
function create(input) {
    document.querySelector('#createtodo').value = '';
    let storeData = {
        id: uuidv4(),
        value: input,
        status: false,
    };
    console.log(storeData);
    data.push(storeData);
    store(nameStore, data);
    domCountItemOfTodo(data);
    if (window.location.hash.indexOf('completed') == 1) {
        return false;
    }
    render(storeData , true);
}

function destroy(e, id) {
    e.parentElement.parentElement.remove()
    data = data.filter(val => val.id !== id);
    console.log(data);
    store(nameStore, data);
    domCountItemOfTodo(data);
}

// toggle
document.querySelector('.todo-list').addEventListener("change", function(e) {
    if (e.target.classList.contains('toggle')) {
        let current = e.target.parentElement.parentElement;
        let id = current.getAttribute('data-id');
        let item = data.find(obj => obj.id == id);
        let checked = e.target.checked;
        item.status = (checked) ? true : false;
        console.log(data);
        if (checked) {
            current.classList.add('completed');
            if (window.location.hash.indexOf('active') !== -1) {
                current.remove();
            }
        } else {
            current.classList.remove('completed');
            if (window.location.hash.indexOf('completed') !== -1) {
                current.remove();
            }
        }   
        store(nameStore, data);
    }
});
// toggle all
document.getElementById('toggle-all').addEventListener('click', (e) => {
    let list = document.querySelectorAll('.main li');
    console.log(list);
    if (list.length === 0) {
        console.log('không cho cập nhật ');
        return false;
    }

    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (!isToggleAll) {
            element.querySelector('.toggle').checked = true;
            element.classList.add('completed');
            if (window.location.hash.indexOf('active') !== -1) {
                element.remove();
            }
        } else {
            element.querySelector('.toggle').checked = false;
            element.classList.remove('completed');
            if (window.location.hash.indexOf('completed') !== -1) {
                element.remove();
            }
        }
    }
    isToggleAll = !isToggleAll;
    data = data.map(obj => ({ ...obj, status: isToggleAll }));
    store(nameStore, data);
})

// editor
document.querySelector('.todo-list').addEventListener('dblclick', function(e) {
    const target = e.target.parentElement.parentElement;
    console.log(target.tagName);
    if (target.tagName === 'LI') {
        const label = target.querySelector('label').textContent;
        const input = target.closest('li');
        input.classList.add('editing');
        input.querySelector('.edit').value = label;
        input.querySelector('.edit').focus();
    }
});

document.querySelector('.todo-list').addEventListener('keyup', (e) => {
    if (e.target.classList.contains('edit')) {
        const code = e.keyCode ? e.keyCode : e.which;
        console.log(code);
        if (code == 13) {
            update(e);
        }
        if (code == 27) {
            e.target.parentElement.classList.remove('editing');
        }
    }
});
document.querySelector('.todo-list').addEventListener("blur", (event) => {
    console.log(event.target);
});


document.querySelector('.todo-list').addEventListener('keyup', (e) => {
    if (e.target.classList.contains('edit')) {
        const code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            update(e);
        }
        if (code == 27) {
            e.target.parentElement.classList.remove('editing');
        }
    }
});



function update(e) {
    const input = e.target.value;
    const parent = e.target.parentElement;
    const id = parent.getAttribute('data-id');
    parent.classList.remove('editing');

    if (input === '') {
        data = data.filter(val => val.id !== id);
        console.log(data);
        store(nameStore, data);
        render(data);
        return false;
    }

    parent.querySelector('label').textContent = input;
    data = data.map(obj => (obj.id === id) ? { ...obj, value: input } : obj);
    store(nameStore, data);
    console.log(id,input);
    
}
// ===================================================================================
function render(dataApend, isApend = false) {
    let getTodo = document.querySelector('.todo-list');
    domCountItemOfTodo(data)
    console.log(dataApend);
    if (isApend) {
        let li = document.createElement('li');
        li.setAttribute('data-id' , data.id);
        li.innerHTML = `
        <li data-id="`+ dataApend.id + `" >
            <div class="view">
                <input class="toggle" type="checkbox" >
                <label>`+ dataApend.value + `</label>
                <button class="destroy" onclick="destroy(this,'`+ dataApend.id + `')" ></button>
            </div>
            <input class="edit" value=""  >
        </li>
        `
        getTodo.appendChild(li);
        return false
    }
    let html = '';
    for (let index = 0; index < dataApend.length; index++) {
        const value = dataApend[index];
        let checked = (value.status) ? 'checked' : '';
        let completedClass = (value.status) ? 'class="completed"' : ''
        html += `
        <li data-id="`+ value.id + `" ` + completedClass + `>
            <div class="view">
                <input class="toggle" type="checkbox" `+ checked + `  >
                <label>`+ value.value + `</label>
                <button class="destroy" onclick="destroy(this,'`+ value.id + `')" ></button>
            </div>
            <input class="edit" value="" >
        </li>
        `;
    }
    getTodo.innerHTML = html;
}

function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function store(name, data) {
    return localStorage.setItem(name, JSON.stringify(data));
}

function domCountItemOfTodo(data = []) {
    document.querySelector('#countTodo').innerHTML = data.length;
}

function checkRoute(data) {
    let dataFilter = [];
    activeButton()
    let active = window.location.hash.indexOf('active');
    let completed = window.location.hash.indexOf('completed');
    if (active != -1) {
        dataFilter = data.filter(el => el.status == false)
    } else if (completed != -1) {
        dataFilter = data.filter(el => el.status == true)
    } else {
        dataFilter = data
    }
    return dataFilter;
}

window.addEventListener('popstate', (event) => {
    let dataFilter = checkRoute(data)
    isToggleAll = dataFilter.every(element => element.status === true)
    render(dataFilter);
});


function activeButton() {
    const hash = window.location.hash;

    document.querySelectorAll('.all, .active, .completed').forEach(element => {
        element.classList.remove('selected');
    });
    
    if (hash.includes('active')) {
        document.querySelector('.active').classList.add('selected');
    } else if (hash.includes('completed')) {
        document.querySelector('.completed').classList.add('selected');
    } else {
        document.querySelector('.all').classList.add('selected');
    }
}