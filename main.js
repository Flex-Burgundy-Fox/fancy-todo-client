$(document).ready(function () {
// console.log('ok masuk')
if (localStorage.getItem('access_token')) {
    afterLogin()
} else {
    beforeLogin()
}

//event handling login
$("#login-form").submit(function (e) { 
    e.preventDefault();
    

    //dapat val dari form login
    let email = $("#login-email").val()
    let password = $("#login-password").val()
    // console.log(email)
    // console.log(password)

    //masuk ke ajax
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/users/login",
        data: {
            email,
            password
        },
    })
    .done(data =>{
        // console.log(data)
        localStorage.setItem('access_token', data.access_token)
        afterLogin()

    })
    .fail(err => {
        console.log(err)
    })
    .always(() =>{
        $("#login-email").val("")
        $("#login-password").val("")
    })
    
})

$("#nav-logout").click((e) => {
    e.preventDefault()
    localStorage.clear()
    beforeLogin()
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
})

$("#register-user").click((e) => {
    e.preventDefault()
    $('#register').show()
    $('#nav-login').hide()
    $('#login').hide()
})

})

function beforeLogin () {
    $('#nav-home').hide()
    $('#nav-add').hide()  
    $('#nav-logout').hide()  
    $('#formTodo').hide()
    $('#TodoList').hide()
    $('#register').hide()
    $('#login').show()
    
}

function afterLogin () {
    $('#nav-home').show()
    $('#nav-add').show()  
    $('#nav-login').hide()  
    $('#nav-register').hide()  
    $('#nav-logout').show()  
    $('#formTodo').show()
    $('#TodoList').show()
    $('#login').hide()
    $('#register').hide()
}

function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    var id_token = googleUser.getAuthResponse().id_token;

    //request with ajax to server
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/" + "users/login-w-google",
        data: {
            token: access_token
        }
        .done((resp) => {
        
        })
        .fail((err) => {

        })
    });
  }