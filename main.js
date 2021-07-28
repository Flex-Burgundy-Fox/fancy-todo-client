const server = "http://localhost:3000"

$(document).ready(() => {
    if(localStorage.getItem("access_token")) afterLogin()
    else beforeLogin()

    $("#loginForm").submit(login);
    $("#registerForm").submit(register);
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
            $("#todoList").append(`
            <li class="list-group-item">${todo.title} <button class="btn btn-danger">Delete</button></li>
            `);
        });        
    }).fail(err => console.log(err))
}