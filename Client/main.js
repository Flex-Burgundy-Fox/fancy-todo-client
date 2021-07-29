const url = "http://localhost:3000/"

$(document).ready(function () {
    if (localStorage.getItem("access_token")) {
        afterLogin()
    } else {
        beforeLogin();
    }    

    $("#nav-logout").click(logout);
    $("#nav-register").click(register);
    $("#nav-home").click(function(e) {
        e.preventDefault()
        afterLogin()
    });

    $("#add-button").click(function (e) { 
        e.preventDefault();
        $("#homepage").hide();
        $("#addTodo-cont").show(); 
    });

    $("#form-login").submit(login)
    $("#form-addTodo").submit(addTodo);
    $("#form-editTodo").submit(postEditTodo);
    
    fetchTodo()
});

function fetchTodo() {
    $.ajax({
        type: "GET",
        url: url + "todos" , 
        headers: {
            access_token: localStorage.getItem("access_token"),        
        }
    })
    .done((data) => {
        console.log(data)
        $("#table-todo").empty();

        data.result.forEach((el, i) => {
            $("#table-todo").append(
                `<tr>
                    <td>${i+1}</td>
                    <td>${el.title}</td>
                    <td>${el.description}</td>
                    <td>${el.status}</td>
                    <td>${new Date(el.due_date).toLocaleDateString('id-ID')}</td>
                    <td>
                        <button type="button" class="btn btn-warning btn-sm" id="edit-button" onClick="editTodo(${el.id})">Edit</button>
                        <button type="button" class="btn btn-danger btn-sm" id="delete-button" onClick="deleteTodo(${el.id})">Delete</button>
                    </td>
                </tr>
                `
            );
        });
    })
    .fail(err => console.log(err))
    .always(() => afterLogin)
}

function beforeLogin(){
    $("#nav-logout").hide();
    $("#homepage").hide();
    $("#regis-cont").hide();
    $("#login-cont").show();
    $("#nav-login").show();
    $("#nav-register").show();
    $("#addTodo-cont").hide();
    $("#editTodo-cont").hide();

}

function afterLogin() {
    $("#nav-logout").show();
    $("#login-cont").hide();
    $("#nav-register").hide();
    $("#nav-login").hide();
    $("#homepage").show();
    $("#regis-cont").hide();
    $("#addTodo-cont").hide();
    $("#editTodo-cont").hide();

}

function login(e) {
    e.preventDefault();
        
    let email = $("#email-login").val()
    let password = $("#password-login").val()

    $.ajax({
        type: "POST",
        url: url + "users/login",
        data: {
            email, 
            password
        }
    })
        .done((data) => {
            localStorage.access_token = data.access_token
            afterLogin()
        })
        .fail((err) => {
            console.log(err);
        })
        .always(() => {
        })
}

function register(e){
    e.preventDefault();

    $("#regis-cont").show();
    $("#login-cont").hide();

    let email = $("#email-login").val()
    let password = $("#password-login").val()
    $.ajax({
        type: "POST",
        url: url + "users/register",
        data: {
            email, password
        }
    })
        .done((data) => {
            console.log(data)
        })
        .fail((err) => {
            console.log(err)
        })
        .always()   
}

function logout(e) {
    e.preventDefault();
        
    localStorage.clear()
    beforeLogin()
}

function addTodo(e) {
    e.preventDefault();
    
    let title = $("#title-add").val()
    let description = $("#description-add").val()
    let status = $("#status-add").val();
    let due_date = $('#due_date-add').val();

    $.ajax({
        type: "POST",
        url: url + "todos" , 
        data: {
            title, description, status, due_date
        },
        headers: {
            access_token: localStorage.getItem("access_token"),
          },
    })
        .done(data => {
            $("#homepage").show();
            $("#addTodo-cont").hide();

            fetchTodo()
        })
        .fail(err => {
            console.log(err);
        })
        .always()
}

function editTodo(id) {
    $("#homepage").hide();
    $("#editTodo-cont").show();
    localStorage.setItem("todoId", id)

    $.ajax({
        type: "GET",
        url: url + "todos/" +  id,
        headers: {
            access_token: localStorage.getItem("access_token"),
        },
    })
    .done((todo) => {
        $("#title-edit").val(`${todo.result.title}`)
        $("#description-edit").val(`${todo.result.description}`)
        $("#status-edit option:selected" ).text(`${todo.result.status}`);
        $('#due_date-edit').val(`${new Date(todo.result.due_date).toLocaleDateString("fr-CA")}`);
    })
    .fail((err) => console.log(err))
}

function postEditTodo(e) {
    e.preventDefault()

    let title = $("#title-edit").val()
    let description = $("#description-edit").val()
    let status = $("#status-edit").val()
    let due_date = $('#due_date-edit').val()

    $.ajax({
        type: "PUT",
        url: url + "todos/" +  localStorage.getItem("todoId"),
        data: {
            title, description, status, due_date
        },
        headers: {
            access_token: localStorage.getItem("access_token"),
        },
    })
    .done(() => {
        $("#homepage").show();
        $("#editTodo-cont").hide();
        localStorage.removeItem("todoId")

        fetchTodo()
    })
    .fail(err => console.log(err))
}

function deleteTodo(id) {
    $.ajax({
        type: "DELETE",
        url: url + "todos/" + id,
        headers: {
            access_token: localStorage.getItem("access_token"),
        },
    })
    .done(() => {
        fetchTodo()
    })
    .fail((err) => console.log(err))

}
