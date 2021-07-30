const baseURL = "http://localhost:3000"

$(document).ready(function() {
  if (localStorage.getItem("access_token")) {
    afterLogin()
  } else {
    beforeLogin()
  }

  // event handling
  $("#nav-register").click(function (e) { 
    e.preventDefault()
    
    formRegister()
  })

  $("#button-register").click(function (e) { 
    e.preventDefault()
    
    formRegister()
  })

  $("#nav-login").click(function (e) { 
    e.preventDefault()
    
    beforeLogin()
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
    e.preventDefault();

    let id = localStorage.getItem("idTodo")
    
    updateTodo(id)
  });

  // event handling

  $("#register-form").submit(function (e) { 
    e.preventDefault()
    
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
      .fail((err) => console.log(err))
      .always(() => {
        $("#register-email").val("")
        $("#register-password").val("")
      })
  })

  $("#login-form").submit(function (e) { 
    e.preventDefault()

    const email = $("#login-email").val()
    const password = $("#login-password").val()
    
    $.ajax({
      type: "POST",
      url: `${baseURL}/users/login`,
      data: {
        email, password
      }
    })
      .done((data) => {
        localStorage.setItem("access_token", data.access_token)

        afterLogin()
      })
      .fail((err) => {
        // show notif fail login
        console.log(err)
      })
      .always(() => {
        $("#login-email").val("")
        $("#login-password").val("")
      })
  })
})

function formRegister() {
  // navbar
  $("#nav-login").show()
  $("#nav-register").hide()

  // page
  $("#form-register").show()
  $("#form-login").hide()
}

function beforeLogin() {
  // navbar
  $("#nav-register").show()
  $("#nav-login").hide()
  $("#nav-logout").hide()
  
  $("#nav-addTodo").hide()
  
  // page
  $("#form-register").hide()
  $("#form-login").show()

  $("#todo-list").hide()
}

// getBasicProfile() 
function onSignIn(googleUser) {
  // const profile = googleUser.getBasicProfile();
  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('Name: ' + profile.getName());
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  const id_token = googleUser.getAuthResponse().id_token;

  $.ajax({
    type: "POST",
    url: `${baseURL}/users/google-login`,
    data: {
      token: id_token
    }
  })
    .done((data) => {
      localStorage.setItem("access_token", data.access_token)
        
      afterLogin()
    })
    .fail((err) => console.log(err))
}

function afterLogin() {
  // navbar
  $("#nav-register").hide()
  $("#nav-login").hide()

  $("#nav-logout").show()

  $("#nav-addTodo").show()

  // page
  $("#form-register").hide()
  $("#form-login").hide()

  $("#todo-list").show()

  fetchTodos()
}

// logout with google sign-out
function logout() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
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
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#modal-details" onClick="detailTodo(${todo.id})">
                  Detail
                </button>
                <button type="submit" class="btn btn-danger btn-sm" onClick="destroyTodo(${todo.id})">Delete</button>
                <button type="submit" class="btn btn-success btn-sm" onClick="statusFinished(${todo.id})">Finished</button>
              </td>
            </tr>
          `
        )
      })
    })
    .fail((err) => console.log(err))
}

function detailTodo(id) {
  $.ajax({
    type: "GET",
    url: `${baseURL}/todos/${id}`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(({ todo }) => {
      $("#modal-dialog-detail").empty()

      $("#modal-dialog-detail").append(
        `
        <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-detailsLabel">${todo.status}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="card">
                  <h5 class="card-header">${todo.title}</h5>
                  <div class="card-body">
                    <h5 class="card-title">${new Date(todo.due_date).toLocaleDateString('fr-CA')}</h5>
                    <p class="card-text">${todo.description}</p>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-update" onClick="editTodo(${todo.id})">
                  Update
                </button>
              </div>
            </div>
        `
      )
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
      $(".fade").hide()

      fetchTodos()
    })
    .fail((err) => console.log(err))
}

function statusFinished(id) {
  const input = {
    status: "Done"
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
}

function editTodo(id) {
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
        // $("#status-finished").attr("checked", false)
      } else {
        // $("#status-inProgress").attr("checked", false)
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
    .done((todo) => {
      fetchTodos()
      console.log(todo)
    })
    .fail((err) => console.log(err))
}

function destroyTodo(id) {
  $.ajax({
    type: "DELETE",
    url: `${baseURL}/todos/${id}`,
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  })
    .done(() => fetchTodos())
    .fail((err) => console.log(err))
}

