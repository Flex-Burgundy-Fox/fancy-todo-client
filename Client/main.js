$(document).ready(function () {
    console.log(localStorage.getItem("access_token"))
    if (localStorage.getItem("access_token")) {
        afterLogin()
    } else {
        beforeLogin();
    }        

    $("#form-login").submit(login)
    $("#nav-logout").click(logout);
    $("#nav-register").click(register);
    $("#add-button").click(function (e) { 
        e.preventDefault();
        
        $("#homepage").hide();
        $("#addTodo-cont").show();

    });
    $("#form-addTodo").submit(addTodo);
});

function beforeLogin(){
    $("#nav-logout").hide();
    $("#homepage").hide();
    $("#regis-cont").hide();
    $("#login-cont").show();
    $("#nav-login").show();
    $("#nav-register").show();
}

function afterLogin() {
    $("#nav-logout").show();
    $("#login-cont").hide();
    $("#nav-register").hide();
    $("#nav-login").hide();
    $("#homepage").show();
    $("#regis-cont").hide();
    $("#addTodo-cont").hide();
}

function login(e) {
    e.preventDefault();
        
    let email = $("#email-login").val()
    let password = $("#password-login").val()

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/users/login",
        data: {
            email, 
            password
        }
    })
        .done((data) => {
            console.log(data)
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
        url: "http://localhost:3000/users/register",
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
    let due_date = $('.datepicker').datepicker();


    console.log(title, description, status, due_date)

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/todos",
        data: {
            title, description, status, due_date
        },
        headers: {
            access_token: localStorage.getItem("access_token"),
          },
    })
        .done(data => {
            console.log(data)
        })
        .fail(err => {
            console.log(err);
        })
        .always()
}