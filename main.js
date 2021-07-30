$(document).ready(function () {
// console.log('ok masuk')
if (localStorage.getItem('access_token')) {
    afterLogin()
} else {
    beforeLogin()
}

//event handling login
$("#login-form").submit(userLogin)

$("#nav-logout").click(userLogout)

$("#register-user").click((e) => {
    e.preventDefault()
    $('#register').show()
    $('#nav-login').hide()
    $('#login').hide()
})

$("#nav-register").click((e) => {
    e.preventDefault()
    $('#register').show()
    $('#nav-login').hide()
    $('#login').hide()
})

})

function beforeLogin () {
    $('.navbar-brand').hide() 
    $('#nav-home').hide() 
    $('#nav-logout').hide()  
    $('#formTodo').hide()
    $('#TodoList').hide()
    $('#register').hide()
    $('#login').show()
    
}

function afterLogin () {
    $('#nav-home').show()
    $('#nav-login').hide()  
    $('#nav-register').hide()  
    $('#nav-logout').show()  
    $('#formTodo').show()
    $('#TodoList').show()
    $('#login').hide()
    $('#register').hide()

    showTodos()
}

function userLogin(e) {
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
    
}

function userLogout(e) {
    e.preventDefault()
    localStorage.clear()
    beforeLogin()
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
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
            access_token : id_token
        }
        .done((resp) => {
        console.log(resp)
        })
        .fail((err) => {

        })
    });
}

function showTodos() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/todos/",
        headers: {
            access_token : localStorage.getItem('access_token')
        }
    })
    .done(({ result }) => {
        // console.log(result)
        $("#TodoList").empty()
        result.forEach((todo) => {
            let date = todo.due_date.split('T')[0]
            $("#TodoList").append(`
            <div class="card text-dark bg-light mb-3" style="max-width: 18rem;">
            <div class="card-header">Todos:</div>
            <div class="card-body">
              <h5 class="card-title">${todo.title}</h5>
              <p class="card-text">${todo.description}</p>
              <p class="card-text">${date}</p>
         </div>
              <button type="button" class="btn btn-success">Done</button>
              <button type="button" class="btn btn-danger">Delete</button>
            </div>
          </div>`)
        })

    })
    .fail(err => {
        console.log(err)
    })
}