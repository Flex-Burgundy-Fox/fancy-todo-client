const baseURL = "http://localhost:3000"
let emailUser

$(document).ready(function() {
  if (localStorage.getItem("access_token")) {
    afterLogin()
  } else {
    beforeLogin()
  }
  
  // event handling
  $("#id-navbar-brand").click(function (e) { 
    e.preventDefault()
    
    afterLogin(emailUser)
  })

  $("#nav-register").click(function (e) { 
    e.preventDefault()
    
    pageRegister()
  })

  $("#button-register").click(function (e) { 
    e.preventDefault()
    
    formRegister()
  })

  $("#nav-login").click(function (e) { 
    e.preventDefault()
    
    beforeLogin()
  })

  $("#nav-addTodo").click(function (e) { 
    e.preventDefault()
    
    $("#table-todoList").hide()
    $("#form-addTodo").show()
  })

  $("#nav-logout").click(function (e) { 
    e.preventDefault()
    
    localStorage.clear()

    logout()

    beforeLogin()
  })

  $("#addTodo-form").submit(function (e) { 
    e.preventDefault()
    
    addTodo()
  })

  $("#updateTodo-form").submit(function (e) { 
    e.preventDefault()

    let id = localStorage.getItem("idTodo")
    
    updateTodo(id)
  })

  $("#close-addTodo").click(function (e) { 
    e.preventDefault()
    
    $("#title").val(""),
    $("#description").val("")
    $("#due_date").val("")

    afterLogin(emailUser)
  })

  $("#close-detailTodo").click(function (e) { 
    e.preventDefault()
    
    afterLogin(emailUser)
  })

  $("#close-updateTodo").click(function (e) { 
    e.preventDefault()
    
    afterLogin(emailUser)
  })


  $("#register-form").submit(function (e) { 
    e.preventDefault()
    
    formRegister()
  })

  $("#login-form").submit(function (e) { 
    e.preventDefault()

    formLogin()
  })
})

function pageRegister() {
  // navbar
  $("#nav-login").show()
  $("#nav-register").hide()

  // page
  $("#form-register").show()
  $("#form-login").hide()
}

function formRegister() {
  const email = $("#register-email").val()
  const password = $("#register-password").val()

  $.ajax({
    type: "POST",
    url: `${baseURL}/users/register`,
    data: {
      email, password
    }
  })
    .done(() => {
      beforeLogin()
    })
    .fail((err) => {
      err.responseJSON.messages.forEach((el) => {
        $("#register-form").prepend(
          `
            <div class="alert alert-danger" id="alert-register" role="alert">
              ${el.message ? el.message : el}
            </div>
          `
        )
        $("#alert-register").fadeTo(2000, 500).slideUp(500, function(){
          $("#alert-register").slideUp(500)
        })
      })
    })
    .always(() => {
      $("#register-email").val("")
      $("#register-password").val("")
    })
}

function formLogin() {
  const email = $("#login-email").val()
  const password = $("#login-password").val()
    
  $.ajax({
    type: "POST",
    url: `${baseURL}/users/login`,
    data: {
      email,
      password,
      emailUser: localStorage.setItem("emailUser", email)
    }
  })
    .done((data) => {
      localStorage.setItem("access_token", data.access_token)

      afterLogin(localStorage.getItem("emailUser"))
    })
    .fail((err) => {
      // show notif fail login
      err.responseJSON.messages.forEach((el) => {
        $("#login-form").prepend(
          `
            <div class="alert alert-danger" id="alert-login" role="alert">
              ${el}
            </div>
          `
        )
        $("#alert-login").fadeTo(2000, 500).slideUp(500, function(){
          $("#alert-login").slideUp(500)
        })
      })
    })
    .always(() => {
      $("#login-email").val("")
      $("#login-password").val("")
    })
}

function beforeLogin() {
  // navbar
  $("#nav-register").show()
  $("#nav-login").hide()
  $("#welcome").hide()
  $("#dropdown-addTodo-logout").hide()
  
  // page
  $("#form-register").hide()
  $("#form-login").show()

  $("#table-todoList").hide()
  $("#form-addTodo").hide()
  $("#card-detailTodo").hide()
  $("#form-updateTodo").hide()
}

// getBasicProfile() 
function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile()
  // console.log('ID: ' + profile.getId()) // Do not send to your backend! Use an ID token instead.
  // console.log('Name: ' + profile.getName())
  // console.log('Image URL: ' + profile.getImageUrl())
  // console.log('Email: ' + profile.getEmail()) // This is null if the 'email' scope is not present.
  const id_token = googleUser.getAuthResponse().id_token

  $.ajax({
    type: "POST",
    url: `${baseURL}/users/google-login`,
    data: {
      token: id_token
    }
  })
    .done((data) => {
      localStorage.setItem("access_token", data.access_token)
      
      emailUser = profile.getEmail()
        
      afterLogin(emailUser)
    })
    .fail((err) => console.log(err))
}

function afterLogin(email) {
  // navbar
  $("#nav-register").hide()
  $("#nav-login").hide()
  $("#nav-addTodo").show()

  $("#welcome").show()
  $("#dropdown-addTodo-logout").show()

  $("#dropdown-addTodo-logout").empty()

  $("#card-detailTodo").hide()
  $("#form-updateTodo").hide()
  $("#form-addTodo").hide()

  if (email) {
    $("#dropdown-addTodo-logout").append(
      `
        <span>${email}</span>
      `
    )
  } else {
    $("#dropdown-addTodo-logout").append(
      `
        <span>${localStorage.getItem("emailUser")}</span>
      `
    )
  }

  // page
  $("#form-register").hide()
  $("#form-login").hide()

  $("#table-todoList").show()

  fetchTodos()
}

// logout with google sign-out
function logout() {
  const auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(function () {
    console.log('User signed out.')
  })
}

function fetchTodos() {
  $.ajax({
    type: "GET",
    url: `${baseURL}/todos`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(({ todos }) => {
      $("#table-todos").empty()

      todos.forEach((todo, index) => {
        $("#table-todos").append(
          `
            <tr>
              <th scope="row">${index+1}</th>
              <td>${todo.title}</td>
              <td>${todo.status}</td>
              <td>
                <button type="button" class="btn btn-info btn-sm" onClick="detailTodo(${todo.id})">
                  Detail
                </button>
                <button type="submit" class="btn btn-danger btn-sm" onClick="destroyTodo(${todo.id})">Delete</button>
                <button type="submit" class="btn btn-success btn-sm" onClick="statusFinished(${todo.id})">${todo.status === "Not Done" ? "Finished" : "Unfinished"}</button>
              </td>
            </tr>
          `
        )
      })
    })
    .fail((err) => console.log(err))
}

function addTodo() {
  const input = {
    title: $("#title").val(),
    description: $("#description").val(),
    status: $("#status").val(),
    due_date: $("#due_date").val(),
    UserId: localStorage.getItem("access_token")
  }

  $.ajax({
    type: "POST",
    url: `${baseURL}/todos`,
    data: input,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(() => {
      afterLogin(emailUser)

      fetchTodos()
    })
    .fail((err) => {
      err.responseJSON.messages.forEach((el) => {
        $("#addTodo-form").prepend(
          `
            <div class="alert alert-danger" id="alert-add" role="alert">
              ${el}
            </div>
          `
        )
        $("#alert-add").fadeTo(2000, 500).slideUp(500, function(){
          $("#alert-add").slideUp(500)
        })
      })
    })
    .always(() => {
      $("#title").val(""),
      $("#description").val("")
      $("#due_date").val("")
    })
}

function detailTodo(id) {
  $("#nav-addTodo").hide()

  $("#table-todoList").hide()
  $("#card-detailTodo").show()

  $.ajax({
    type: "GET",
    url: `${baseURL}/todos/${id}`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(({ todo }) => {
      $("#card-detailTodo").empty()

      $("#card-detailTodo").append(
        `
          <div class="container py-5">
            <div class="row d-flex justify-content-center align-items-center">
              <div class="col col-lg-9 col-xl-10">
                <div class="shadow-lg p-3 mb-5 bg-white rounded">
                  <div class="card rounded-3">
                    <div class="card-body p-4">
          
                      <h4 class="text-center my-3 pb-3">Detail Todo</h4>

                      <h5 class="card-title">${todo.title}</h5>
                      <p class="card-text">${todo.description}</p>
                      <p class="card-text">${todo.status}</p>
                      <p class="card-text">${new Date(todo.due_date).toLocaleDateString('fr-CA')}</p>
                      <hr>
                      <button type="button" class="btn btn-primary fa-pull-right" onClick="editTodo(${todo.id})">
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      )
    })
    .fail((err) => console.log(err))
}

function statusFinished(id) {
  $.ajax({
    type: "GET",
    url: `${baseURL}/todos/${id}`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
  .done(({ todo }) => {
    let input = {}

    if (todo.status === "Not Done") {
      input.status = "Done"
    } else {
      input.status = "Not Done"
    }

    $.ajax({
      type: "PATCH",
      url: `${baseURL}/todos/${id}`,
      data: input,
      headers: {
        access_token: localStorage.getItem("access_token")
      }
    })
      .done(() => fetchTodos())
      .fail((err) => console.log(err))
  })
  .fail((err) => console.log(err))

}

function editTodo(id) {
  $("#card-detailTodo").hide()
  $("#form-updateTodo").show()

  $.ajax({
    type: "GET",
    url: `${baseURL}/todos/${id}`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(({ todo }) => {
      localStorage.setItem("idTodo", todo.id)

      $("#title-edit").val(todo.title),
      $("#description-edit").val(todo.description)
      
      if (todo.status === "Not Done") {
        $("#status-inProgress").attr("checked", true)
      } else {
        $("#status-finished").attr("checked", true)
      }

      $("#due_date-edit").val(new Date(todo.due_date).toLocaleDateString('fr-CA'))
    })
    .fail((err) => console.log(err))
}

function updateTodo(id) {
  let status

  if ($("#status-inProgress").val() === "on") {
    status = "Not Done"
  } else {
    status = "Done"
  }

  const input = {
    title: $("#title-edit").val(),
    description: $("#description-edit").val(),
    status,
    due_date: $("#due_date-edit").val(),
    UserId: localStorage.getItem("access_token")
  }

  $.ajax({
    type: "PUT",
    url: `${baseURL}/todos/${id}`,
    data: input,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(() => {
      $("#nav-addTodo").show();

      $("#form-updateTodo").hide()
      $("#table-todoList").show()

      fetchTodos()
    })
    .fail((err) => {
      err.responseJSON.messages.forEach((el) => {
        $("#updateTodo-form").prepend(
          `
            <div class="alert alert-danger" id="alert-update" role="alert">
              ${el}
            </div>
          `
        )
        $("#alert-update").fadeTo(2000, 500).slideUp(500, function(){
          $("#alert-update").slideUp(500)
        })
      })
    })
}

function destroyTodo(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    preConfirm: () => {
      $.ajax({
        type: "DELETE",
        url: `${baseURL}/todos/${id}`,
        headers: {
          access_token: localStorage.getItem("access_token")
        }
      })
        .done((data) => {
          Swal.fire(
            'Deleted!',
            data.message,
            'success'
          )
          fetchTodos()
        })
        .fail((err) => {
          err.responseJSON.messages.forEach((el) => {
            $("#table-todoList").prepend(
              `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                  ${el}
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
              `
            )
          })
        })
    }
  }) 
}

