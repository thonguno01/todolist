const nameStore = 'todolist';
var data = (localStorage.getItem(nameStore) == null) ? [] : JSON.parse(localStorage.getItem(nameStore))
console.log(data);
let dataFilter = checkRoute(data);
var isToggleAll = dataFilter.every(element => element.status === true);
render(dataFilter);
activeButton();



// create todo
$("#createtodo").keyup(function (e) {
    var code = e.keyCode ? e.keyCode : e.which;
    let input = $("#createtodo").val().trim();
    if (code == 13 && input != "") {
        create(input);
    }
});

// destroy 
function destroy(e, id) {
    e.parentElement.parentElement.remove()
    data = data.filter(val => val.id !== id);
    store(nameStore, data);
    $('#countTodo').html(data.length)
}
// toggle completed 

$('.todo-list').on('change', '.toggle', (e) => {
    let current = $(e.currentTarget.parentElement.parentElement);
    console.log(current);
    let checked = e.target.checked;
    console.log(checked);
    // return false
    let id = current.attr('data-id');
    let item = getDataFromObject(id, data);
    item.status = (checked) ? true : false;
    if (checked) {
        current.addClass('completed')
        if (window.location.hash.indexOf('active') !== -1) {
            current.remove();
        }
    } else {
        current.removeClass('completed')
        if (window.location.hash.indexOf('completed') !== -1) {
            current.remove();
        }
    }
    store(nameStore, data);
})

$('#toggle-all').on('click', (e) => {
    let list = $('.main').find('li');
    if (list.length == 0) {
        console.log('không cho cập nhật ');
        return false;
    }
    
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (!isToggleAll) {
            $(element).find('.toggle').prop('checked', true)
            $(element).addClass('completed')
            if (window.location.hash.indexOf('active') !== -1) {
                $(element).remove()
            }
        } else {
            $(element).find('.toggle').prop('checked', false)
            $(element).removeClass('completed')
            if (window.location.hash.indexOf('completed') !== -1) {
                $(element).remove()
            }
        }
    }

    isToggleAll = !isToggleAll;
    data = data.map(obj => ({ ...obj, status: isToggleAll }));
    store(nameStore, data);
})
// update value with double click 
$(".todo-list").on("dblclick", 'li', function (e) {
    let label = $(e.currentTarget).find('label').text();
    let input = $(e.target).closest('li').addClass('editing').find('.edit');
    input.val(label);
    input.trigger("focus")
});

$('.todo-list').on('blur', '.edit', (e) => {
    update(e);
})
$('.todo-list').on('keyup', '.edit', function (e) {
    var code = e.keyCode ? e.keyCode : e.which; 
    if (code == 13) {
        update(e)
    }
    if (code == 27) {
        $(e.target).parent().removeClass('editing');
    }
});


// create todo
function create(input) {
    clearInput();
    let storeData = {
        id: uuidv4(),
        value: input,
        status: false,
    };
    console.log(storeData);
    data.push(storeData);
    store(nameStore, data);
    $('#countTodo').html(data.length)
    if (window.location.hash.indexOf('completed') == 1) {
        return false;
    }
    render(storeData, true);
}
// cập nhật 
function update(e) {
    let input = $(e.target).val();
    let parent = $(e.target).parent()
    parent.removeClass('editing');
    let id = parent.attr('data-id');
    if (input == '') {
        data = data.filter(val => val.id !== id);
        console.log(data);
        store(nameStore, data);
        render(data)        
        return false;
    }
    parent.find('label').text(input);
    data = data.map(obj => {
        if (obj.id === id) {
            return { ...obj, value: value };
        }
        return obj;
    });
    store(nameStore, data);
}

function clearInput() {
    $("#createtodo").val("");
}


// ======================================================================================================
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

function render(dataApend, isApend = false) {
    let getTodo = $('.todo-list');
    $('#countTodo').html(data.length)
    console.log(dataApend);
    if (isApend) {
        let html = `
        <li data-id="`+ dataApend.id + `" >
            <div class="view">
                <input class="toggle" type="checkbox" >
                <label>`+ dataApend.value + `</label>
                <button class="destroy" onclick="destroy(this,'`+ dataApend.id + `')" ></button>
            </div>
            <input class="edit" value=""  >
        </li>
        `
        getTodo.append(html);
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
            `
    }
    getTodo.html(html);

}

function getDataFromObject(id, object) {
    return object.find(obj => obj.id == id);
}

// filter
window.addEventListener('popstate', (event) => {
    let dataFilter = checkRoute(data)
    isToggleAll = dataFilter.every(element => element.status === true)
    render(dataFilter);
});

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

function activeButton() {

    if (window.location.hash.indexOf('active') != -1) {
        $('.all').removeClass('selected');
        $('.active').addClass('selected');
        $('.completed').removeClass('selected');

    } else if (window.location.hash.indexOf('completed') != -1) {
        $('.all').removeClass('selected');
        $('.active').removeClass('selected');
        $('.completed').addClass('selected');
    } else {
        $('.all').addClass('selected');
        $('.active').removeClass('selected');
        $('.completed').removeClass('selected');
    }

}