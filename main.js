const server = "http://localhost:3000"
let editTodoId 
$(document).ready(() => {
    if(localStorage.getItem("access_token")) afterLogin()
    else beforeLogin()

    $("#loginForm").submit(login);
    $("#registerForm").submit(register);
    $("#addTodoForm").submit(addTodo)
    $("#editTodoForm").submit(editTodo)
});

function beforeLogin(){
    $("#registerForm").hide();
    $("#loginForm").show();
    $(".nav-link").hide();
    $("#todos").hide();
}

function showRegister(){
    $("#registerForm").show();
    $("#loginForm").hide();
}

function afterLogin(){
    $("#loginForm").hide();
    $("#registerForm").hide();
    $(".nav-link").show();
    $("#todos").show();

    showTodos()
}

function logout(){
    delete localStorage.access_token
    beforeLogin()
}

function login(e) { 
    e.preventDefault();
    let data  = {
        email : $("#inputEmail").val(),
        password : $("#inputPassword").val()
    }
    $.ajax({
        type: "POST",
        url: server + "/login",
        data
    })
    .done(({access_token}) => {
        localStorage.setItem('access_token',access_token)
        afterLogin()
    }).fail(err => console.log(err))
    .always(()=>{
        $("#inputEmail").val("");
        $("#inputPassword").val("");
    })
}

function register(e){
    e.preventDefault();
    let data  = {
        email : $("#registerEmail").val(),
        password : $("#registerPassword").val()
    }
    $.ajax({
        type: "POST",
        url: server + "/register",
        data
    })
    .done(() => {
        beforeLogin()
    }).fail(err => console.log(err))
    .always(()=>{
        $("#registerEmail").val("");
        $("#registerPassword").val("");
    })
}

function showTodos(){
    $.ajax({
        type: "GET",
        url: server + "/todos",
        headers : {
            access_token : localStorage.access_token
        }
    })
    .done(data => {
        $("#todoList").empty();
        data.forEach(todo => {

            let htmlTodo = `
            
            <div class="col" id="title">${todo.title}</div>

            <div class="col-6">
                <button onclick="viewEditForm(${todo.id})" data-bs-toggle="modal" data-bs-target="#modal-editTodo" class="btn btn-primary">Edit</button>
            `

            if(todo.status === "Done") {
            htmlTodo += 
            `
            <button onclick="patchTodo(${todo.id},'${todo.status}')" class="btn btn-warning">Unfinished</button>
            <button onclick="deleteTodo(${todo.id})" class="btn btn-danger">Delete</button>
            </div>`
            }
            else {
            htmlTodo +=
            `
            <button onclick="patchTodo(${todo.id},'${todo.status}')"  class="btn btn-success">Finished</button>
            <button onclick="deleteTodo(${todo.id})" class="btn btn-danger">Delete</button>
            </div>`
            }

            $("#todoList").append(htmlTodo);
        });        
    }).fail(err => console.log(err))
}

function addTodo(e){
    e.preventDefault()
    let data = {
        title : $("#add_title").val(),
        description : $("#add_description").val(),
        due_date : $("#add_due_date").val(),
    }
    
    $.ajax({
        type: "POST",
        url: server + "/todos",
        headers : {
            access_token : localStorage.access_token
        },
        data
    })
    .done(() => {
        showTodos()
    })
    .fail(err => console.log(err))
    .always(()=>{
        $("#add_title").val("");
        $("#add_description").val("");
        $("#add_due_date").val("");
    })
}

function deleteTodo(todoId){
    $.ajax({
        type: "DELETE",
        url: server + "/todos/" + todoId,
        headers : {
            access_token : localStorage.access_token
        }
    })
    .done(() => {
        showTodos()
    })
    .fail(err => console.log(err))
}

function patchTodo(todoId,todoStatus){
    // console.log(todo,a);
    if(todoStatus === "Done"){
        todoStatus = "Not Done"
    }else{
        todoStatus = "Done"
    }

    $.ajax({
        type: "PATCH",
        url: server + "/todos/" + todoId,        
        data: {status : todoStatus},
        headers : {
            access_token : localStorage.access_token
        }
    })
    .done(() => {
        showTodos()
    })
    .fail(err => console.log(err))
}

function viewEditForm(todoId){
    // console.log(todo,a);

    $.ajax({
        type: "GET",
        url: server + "/todos/" + todoId,        
        headers : {
            access_token : localStorage.access_token
        }
    })
    .done(todo => {
        $("#editTodoForm").empty();
        let due_date = todo.due_date.split('T')[0]
        editTodoId = todo.id
        let htmlEditForm = `
        
            <div class="mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input type="string" class="form-control" id="edit_title" value="${todo.title}">
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea class="form-control" id="edit_description">${todo.description}</textarea>
                </div>

                <div class="mb-3">
                  <label for="due_date" class="form-label">Date</label>
                  <input type="date" class="form-control" id="edit_due_date" value="${due_date}">
                </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
            </div>
            `

        $("#editTodoForm").append(htmlEditForm);
    })
    .fail(err => console.log(err))
}

function editTodo(e){
    e.preventDefault()
    let data = {
        title : $("#edit_title").val(),
        description : $("#edit_description").val(),
        due_date : $("#edit_due_date").val(),
    }
    
    $.ajax({
        type: "PUT",
        url: server + "/todos/" + editTodoId,
        headers : {
            access_token : localStorage.access_token
        },
        data
    })
    .done(() => {
        showTodos()
    })
    .fail(err => console.log(err))
}
