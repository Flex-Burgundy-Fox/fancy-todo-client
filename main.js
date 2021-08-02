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
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut()
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
        localStorage.setItem('access_token', access_token)
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
        let htmlTodo
        if(!data.length) {
            htmlTodo = 
            `
            <p><em>You don't have any todo, you can add some todo from navbar below</em></p>
            `
            $("#todoList").append(htmlTodo);
        }else{

            data.forEach(todo => {
                
                htmlTodo = `
                <div class="row my-3" style="height: 50px;">
                <div class="col-sm-3 py-1" id="title">
                <div class="form-check">
                `
    
                if(todo.status === "Done") {
                    htmlTodo += 
                    `<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" onclick="patchTodo(${todo.id},'${todo.status}')" checked>`
                
                }else {
                    htmlTodo +=
                    `<input class="form-check-input" type="checkbox" value="" onclick="patchTodo(${todo.id},'${todo.status}')" id="flexCheckDefault">`
                
                }
    
                htmlTodo += 
                `
                <label class="form-check-label" for="flexCheckDefault">${todo.title}</label>
                </div>
                </div>
                <div class="col-sm-3 py-1 overflow-auto" style="height: 50px;">${todo.description}</div>
                <div class="col-sm-auto py-1">${todo.due_date.split('T')[0]}</div>
                <div class="col-sm-auto">
                    <button onclick="viewEditForm(${todo.id})" data-bs-toggle="modal" data-bs-target="#modal-editTodo" class="btn btn-primary">Edit</button>
                    <button onclick="deleteTodo(${todo.id},0)" data-bs-toggle="modal" data-bs-target="#modal-deleteTodo"class="btn btn-danger">Delete</button>
                </div>
                </div>
                `
    
                $("#todoList").append(htmlTodo);
            });        
        }
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

function deleteTodo(todoId, deleteCode){
    if(deleteCode === 1){

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
    }else{
        $("#modal-deleteFooter").empty();
        let deleteButton = 
        `
        <button onclick="deleteTodo(${todoId},1)" type="button" class="btn btn-primary" data-bs-dismiss="modal">Delete</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        `
        $("#modal-deleteFooter").append(deleteButton);
    }
}

function patchTodo(todoId, todoStatus){
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
                  <label for="due_date" class="form-label">Due Date</label>
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

function onSignIn(googleUser) {
    
    var id_token = googleUser.getAuthResponse().id_token;
    $.ajax({
        type: "POST",
        url: server + "/login-google",
        data: {
            token : id_token
        },
    })
    .done(({access_token}) => {
        localStorage.setItem('access_token', access_token)
        afterLogin()    
    })
    .fail(err => console.log(err))
}
