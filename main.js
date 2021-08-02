
$(document).ready(function () {
// console.log('ok masuk')
if (localStorage.getItem('access_token')) {
    afterLogin()
} else {
    beforeLogin()
}
// menghandle date picker pada add todos
$('.datepicker').datepicker();

//event handling register
$("#register-form").submit(userRegister)

$("#nav-register").click((e) => {
    e.preventDefault()
    $('#register').show()
    $('#nav-login').hide()
    $('#login').hide()
})

$("#register-user").click((e) => {
    e.preventDefault()
    $('#register').show()
    $('#nav-login').hide()
    $('#login').hide()
})

//event handling login
$("#login-form").submit(userLogin)

//event handling logout
$("#nav-logout").click(userLogout)

//event handling Add Todos
$("#todo-form").submit(addTodos)

//event handling Edit Todos

$("#todo-edit").submit(editTodos)



})

function beforeLogin () {
    $('.navbar-brand').hide() 
    $('#nav-home').hide() 
    $('#nav-logout').hide()  
    $('#todo-form').hide()
    $('#TodoList').hide()
    $('#register').hide()
    $('#login').show()
    $('#todo-edit').hide()
}

function afterLogin () {
    $('#nav-home').show()
    $('#nav-login').hide()  
    $('#nav-register').hide()  
    $('#nav-logout').show()  
    $('#todo-form').show()
    $('#TodoList').show()
    $('#login').hide()
    $('#register').hide()
    $('#todo-edit').hide()

    showTodos()
}

function userRegister(e) {
    e.preventDefault()

    let email = $("#register-email").val()
    let password = $("#register-password").val()
    // console.log(email)
    // console.log(password)

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/users/register",
        data: {
            email,
            password
        }
    })
    .done((data) => {
        // console.log(data)
        beforeLogin()
    })
    .fail((err) => {
        console.log(err)
    })
    .always(() =>{
        $("#register-email").val("")
        $("#register-password").val("")
    })

}

function userLogin(e) {
    e.preventDefault()
    

    //dapat val dari form login
    let email = $("#login-email").val()
    let password = $("#login-password").val()
    // console.log(email)
    // console.log(password)

    //masuk ke ajax
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: 'success',
        title: 'Signed in successfully'
      })
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
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: 'Wrong Email/Password!'
          })
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

    Swal.fire('You have sucessfully logged out!')
}

function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    let id_token = googleUser.getAuthResponse().id_token
    // console.log(id_token)

    //request with ajax to server
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: 'success',
        title: 'Signed in successfully'
      })
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/users/login-w-google",
        data: {
            token : id_token
        }
    })
    .done((data) => {
        // console.log(data)
        localStorage.setItem('access_token', data.access_token)
        afterLogin()
    })
    .fail((err) => {
        console.log(err)
    })
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
            console.log(todo)
            if (todo.status === '') {
                $("#TodoList").append(`
                <div class="card text-dark bg-light mb-3" style="max-width: 18rem;">
                    <div class="card-header">Todos:</div>
                    <div class="card-body">
                    <h5 class="card-title">${todo.title}</h5>
                        <p class="card-text">${todo.description}</p>
                        <p class="card-text">${date}</p>
                    </div>
                        <button type="button" class="btn btn-success" onClick="statusEdit(${todo.id},${todo.status})">Done</button>
                        <button type="button" class="btn btn-warning" onClick="showFormEditTodos(${todo.id})">Edit</button>
                        <button type="button" class="btn btn-danger" onClick="deleteTodos(${todo.id})">Delete</button>
                       
                    </div>
                </div>`)
            } else {
                $("#TodoList").append(`
                <div class="card text-white bg-secondary mb-3" style="max-width: 18rem;">
                    <div class="card-header">Done:</div>
                    <div class="card-body">
                    <h5 class="card-title"><s>${todo.title}</s></h5>
                        <p class="card-text"><s>${todo.description}</s></p>
                        <p class="card-text"><s>${date}</s></p>
                    </div>
                        <button type="button" class="btn btn-danger" onClick="deleteTodos(${todo.id})">Delete</button>
                    </div>
                </div>`)
            }
            
        })

    })
    .fail(err => {
        console.log(err)
    })
}

function addTodos(e) {
    // console.log("masuk")
    e.preventDefault()
    let title = $("#title-add").val()
    let description = $("#description-add").val()
    let due_date = $("#date").val()
    // console.log(title)
    // console.log(description)
    // console.log(typeof due_date)

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/todos/",
        data: {
           title,
           description,
           due_date
        },
        headers: {
            access_token : localStorage.getItem('access_token')
        }
    })
    .done((data) => {
        console.log(data)
        afterLogin()
    })
    .fail((err) => {
        console.log(err)
    })
    .always(() =>{
    $("#title-add").val("")
    $("#description-add").val("")
    $("#date").val("")
    })
}

function deleteTodos(id) {

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
          $.ajax({
            type: "DELETE",
            url: `http://localhost:3000/todos/${id}`,
            headers: {
                access_token : localStorage.getItem('access_token')
            }
        })
        .done(() => {
            afterLogin()
        })
        .fail((err) => {
            console.log(err)
        })
        }
      })
}

function showFormEditTodos(id) {
    $('#todo-form').hide()
    $('#todo-edit').show()
    $.ajax({
        type: "GET",
        url: `http://localhost:3000/todos/${id}`,
        headers: {
            access_token : localStorage.getItem('access_token')
        }
    })
    .done(( { result } ) => {
        localStorage.setItem('IdTodo', id)
        let date = result.due_date.split('T')[0]
        // console.log(result.title)
        $("#title-edit").val(result.title)
        $("#description-edit").val(result.description)
        $("#date-edit").val(date)
    })
}

function editTodos (e) {
    e.preventDefault()

    let title = $("#title-edit").val()
    let description = $("#description-edit").val()
    let due_date = $("#date-edit").val()

    Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Save`,
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: `http://localhost:3000/todos/${localStorage.getItem('IdTodo')}`,
                data: {
                    title,
                    description,
                    due_date
                },
                headers: {
                    access_token : localStorage.getItem('access_token')
                }
            })
            .done(() => {
                afterLogin()
            })
            .fail((err) => {
                console.log(err)
            })
          Swal.fire('Saved!', '', 'success')
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
          afterLogin()
        }
      })

}

function statusEdit(id, todoStatus) {
    todoStatus = 'done'

    $.ajax({
        type: "PATCH",
        url: `http://localhost:3000/todos/${id}`,
        data: {
            status: todoStatus
        },
        headers: {
            access_token : localStorage.getItem('access_token')
        }
    })
    .done(() => {
        afterLogin()
    })
    .fail((err) => {
        console.log(err)
    })
}