$(document).ready(function () {
// console.log('ok masuk')
beforeLogin()

//event handling login
$("#login-form").submit(function (e) { 
    e.preventDefault();
    if (localStorage.getItem('access_token')) {
        afterLogin()
    } else {
        beforeLogin()
    }
    

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
})

})

function beforeLogin () {
    $('#nav-home').hide()
    $('#nav-add').hide()  
    $('#nav-logout').hide()  
    $('#formTodo').hide()
    $('#TodoList').hide()
    
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