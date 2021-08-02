const url = "http://localhost:3000/"

$(document).ready(function () {
    if (localStorage.getItem("access_token")) {
        afterLogin()
    } else {
        beforeLogin();
    }    

    $("#nav-logout").click(logout);
    $("#nav-login").click(function (e) { 
        e.preventDefault();
        
        $("#regis-cont").hide();
        $("#login-cont").show();
    });
    $("#nav-register").click(function (e) { 
        e.preventDefault();

        $("#regis-cont").show();
        $("#login-cont").hide();
    });
    $("#form-register").submit(register);
    $("#nav-home").click(function(e) {
        e.preventDefault()
        afterLogin()
    });

    $("#add-button").click(function (e) { 
        e.preventDefault();
        $("#homepage").hide();
        $("#addTodo-cont").show();
        $("#home-cont").hide();
    });

    $("#form-login").submit(login)
    $("#form-addTodo").submit(addTodo);
    $("#form-editTodo").submit(postEditTodo);
    $("#detailTodo").val();
    
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
        $("#table-todo").empty();

        data.result.forEach((el, i) => {
            let status;
            let table;
            if (el.status == "Undone") {
                table = `<tr class="table-warning">`
                status = `<i class="fas fa-circle" style="color:red"></i>`
            } else {
                table = `<tr class="table-info">`
                status = `<i class="fas fa-circle" style="color:green"></i>`
            }
            $("#table-todo").append(
                ` ${table}
                    <td>${i+1}</td>
                    <td>${el.title}</td>
                    <td>${el.description}</td>
                    <td>${status}</td>
                    <td>${new Date(el.due_date).toLocaleDateString('id-ID')}</td>
                    <td>
                        <button type="button" class="btn btn-info btn-sm" id="show-button" data-toggle="modal" data-target="#detailTodo" onClick="showTodo(${el.id})"><i class="fas fa-info-circle"></i></button>
                        <button type="button" class="btn btn-warning btn-sm" id="edit-button" onClick="editTodo(${el.id})"><i class="far fa-edit"></i></button>
                        <button type="button" class="btn btn-danger btn-sm" id="delete-button" onClick="deleteTodo(${el.id})"><i class="fas fa-trash"></i></button>
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
    $("#nav-home").hide();
    $("#nav-register").show();
    $("#addTodo-cont").hide();
    $("#home-cont").hide();
    $("#editTodo-cont").hide();

}

function afterLogin() {
    $("#nav-logout").show();
    $("#login-cont").hide();
    $("#home-cont").show();
    $("#nav-register").hide();
    $("#nav-login").hide();
    $("#homepage").show();
    $("#regis-cont").hide();
    $("#addTodo-cont").hide();
    $("#editTodo-cont").hide();

    fetchTodo()
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
            swal(`welcome ${email}`)
            afterLogin()
        })
        .fail((err) => {
            error = err.responseJSON.error.join("\n")
            swal(error)        
        })
       
}

function register(e){
    e.preventDefault();

    let email = $("#email-register").val()
    let password = $("#password-register").val()

    $.ajax({
        type: "POST",
        url: url + "users/register",
        data: {
            email, password
        }
    })
        .done((data) => {
            swal(`welcome ${data.email}`)
            beforeLogin()
        })
        .fail((err) => {
            error = err.responseJSON.error.join("\n")
            swal(error)
        })
        .always()   
}

function logout(e) {
    e.preventDefault();
    swal({
        title: "Are you sure?",
        text: "You will Logout!",
        icon: "info",
        buttons: true,
        dangerMode: false,
      })
      .then((willLogout) => {
        if (willLogout) {
          localStorage.clear()
          let auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(function () {
            swal('User signed out.');
          });
          beforeLogin()
        } else {
          swal("Back to your Todo List!");
        }
      });
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
            $("#home-cont").show();

            swal(`your data has been added!!`)
            
            fetchTodo()
        })
        .fail(err => {
            error = err.responseJSON.error.join("\n")
            swal(error)
        })
        .always()
}

function editTodo(id) {
    $("#homepage").hide();
    $("#editTodo-cont").show();
    $("#home-cont").hide();

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
        $("#home-cont").show();

        localStorage.removeItem("todoId")
        swal(`your data has been updated!!`)
        fetchTodo()
    })
    .fail(err => {
        error = err.responseJSON.error.join("\n")
        swal(error)
    })
}

function deleteTodo(id) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          swal("Poof! Your Data has been deleted!", {
            icon: "success",
        });
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
        } else {
          swal("Your data is safe!");
        }
      });

}

function patchTodo(id) {
    swal({
        title: "Are you sure?",
        text: "you will change your status!",
        icon: "info",
        buttons: true,
        dangerMode: false,
      })
      .then((status) => {
        if (status) {
          swal("Poof! Your status has been change!", {
            icon: "info",
          });
          $.ajax({
              type: "GET",
              url: url + "todos/" +  id,
              headers: {
                  access_token: localStorage.getItem("access_token"),
              },
          })
          .done((todo) => {
              let status = todo.result.status
              if (status == "Undone") {
                  status = "Done"
              } else{
                  status = "Undone"
              }
              $.ajax({
                  type: "PATCH",
                  url: url + "todos/" + id,
                  data: {status},
                  headers: {
                      access_token: localStorage.getItem("access_token"),
                  },
              })
              .done((data) => {
                  fetchTodo()
                  showTodo(data.result.id)
              })
              .fail((err) => console.log(err))
          })
          .fail((err) => console.log(err))
        } else {
          swal("Your status doesnt change!");
        }
      });
}

function showTodo(id) { 
    $.ajax({
        type: "GET",
        url: url + "todos/" + id,
        headers: {
            access_token: localStorage.getItem("access_token"),
        },
    })
    .done((data) => {
        $("#detailModal").empty();

        $("#detailModal").append(
            `
            <div class="modal-header">
                <h5 class="modal-title" id="detailModalLabel">Detail Todo</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" id="detailModalBody">
                <table class="table table-bordered no-margin">
                    <tr>
                        <th>Title</th>
                        <td><span>${data.result.title}</span></td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td><span>${data.result.description}</span></td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td><span>${data.result.status}</span></td>
                    </tr>
                    <tr>
                        <th>Due Date</th>
                        <td><span>${new Date(data.result.due_date).toLocaleDateString('id-ID')}</span></td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="patch-button" onClick="patchTodo(${data.result.id})">Change Status</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            `
        );
    })
    .fail((err) => console.log(err))
}

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;

    $.ajax({
        type: "POST",
        url: url+"users/login-google",
        data: {
            token : id_token
        }
    })
    .done((data) => {
        localStorage.access_token = data.access_token
        afterLogin()
    })
    .fail(err => {
        console.log(err);
    })
}
