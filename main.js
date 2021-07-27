const baseURL = "http://localhost:3000"

$(document).ready(function() {
  if (localStorage.getItem("access_token")) {
    afterLogin()
  } else {
    beforeLogin()
  }

  // event handling
  $("#nav-register").click(function (e) { 
    e.preventDefault();
    
    formRegister()
  });

  $("#register-button").click(function (e) { 
    e.preventDefault();
    
    formRegister()
  });

  $("#nav-login").click(function (e) { 
    e.preventDefault();
    
    beforeLogin()
  });

  $("#login-form").submit(function (e) { 
    e.preventDefault();

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
        $("#login-email").val("");
        $("#login-password").val("");
      })
  })
})

$("#nav-logout").click(function (e) { 
  e.preventDefault();
  
  localStorage.clear()
  beforeLogin()
});

function formRegister() {
  // navbar
  $("#nav-login").show();
  $("#nav-register").hide();

  // page
  $("#form-register").show();
  $("#form-login").hide();
}

function beforeLogin() {
  // navbar
  $("#nav-register").show();
  $("#nav-login").hide()
  $("#nav-logout").hide()
  
  $("#nav-addTodo").hide()
  
  // page
  $("#form-register").hide()
  $("#form-login").show();

  $("#todo-list").hide()
}

function afterLogin() {
  // navbar
  $("#nav-register").hide();
  $("#nav-login").hide();

  $("#nav-logout").show();

  $("#nav-addTodo").show();

  // page
  $("#form-register").hide();
  $("#form-login").hide();

  $("#todo-list").show();
}