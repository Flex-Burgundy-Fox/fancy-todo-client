$(document).ready(() => {
    $("#loginForm").submit(login);
});

function login(e) { 
    e.preventDefault();
    let data  = {
        email : $("#inputEmail").val(),
        password : $("#inputPassword").val()
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/login",
        data
    })
    .done(({access_token}) => {
        localStorage.setItem('access_token',access_token)
    }).fail(err => console.log(err))
}