$(document).ready(function () {
    if (localStorage.getItem("token")) {
        afterLogin();
    } else {
        beforeLogin();
    }

    $("#nav-logout").click(logoutHandler);
    $("#login-form").submit(loginHandler);
    $("#btn-register").click(registerHandler);
    $("#add-form").click(addForm);
    $("#btn-dashboard").click(showDashboard);

});

function beforeLogin() {
    $("#login-form").show();
    $("#todo-container").hide();
}

function afterLogin() {
    $("#login-form").hide();
    $("#todo-container").show();

    fetchTodos();
}

function logoutHandler(e) {
    localStorage.clear();
    console.log(localStorage.token);
    beforeLogin();
}

function loginHandler(e) {
    e.preventDefault();

    let email = $("#login-email").val();
    let password = $("#login-password").val();

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/login",
        data: {
            email,
            password,
        },
    })
        .done((data) => {
            localStorage.token = data.token;
            //   localStorage.setItem("token", data.token);

            afterLogin();
        })
        .fail((err) => {
            console.log(err);
            $("#error-login").text(err.responseJSON.error);
        })
        .always(() => {
            $("#login-email").val("");
            $("#login-password").val("");
        });
}

function registerHandler() {
    let email = $("#login-email").val();
    let password = $("#login-password").val();

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/register",
        data: {
            email,
            password
        },
    })
        .done((data) => {
            $("#error-edit").text(data.message);
            document.getElementById('myModal').showModal();
            $("#login-email").val("");
            $("#login-password").val("");
            beforeLogin();
        })
        .fail((err) => {
            $("#error-edit").text(err.responseJSON.error);
            document.getElementById('myModal').showModal()
            console.log(err);
        })
}

function fetchTodos() {
    let due_notes = ''
    let badge_color = ''
    let checkStatus = ''
    let strikethrough = ''
    let today = new Date().toISOString().slice(0, 10);

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/todos",
        headers: {
            token: localStorage.getItem("token"),
        },
    })
        .done(({ count, result }) => {
            // kosongin dulu
            $("#todo-body").empty();

            if (count === 0) {
                $("#todo-body").append(`<p class="text-gray-400 pt-5">${result}</p>`);
            } else {
                result.forEach((todo) => {
                    if (todo.due === 0) {
                        due_notes = "Due today"
                    } else if (todo.due === 1) {
                        due_notes = "Due tomorrow"
                    } else if (todo.due > 1) {
                        due_notes = `Due in ${todo.due} days`
                    } else {
                        due_notes = "You are past the deadline"
                    }

                    if (todo.due < 0) {
                        badge_color = "bg-red-600"
                    } else if (todo.due === 0) {
                        badge_color = "bg-red-400"
                    } else if (todo.due >= 1 && todo.due <= 3) {
                        badge_color = "bg-yellow-500"
                    } else if (todo.due > 3) {
                        badge_color = "bg-green-500"
                    }

                    if (todo.status === "Closed") {
                        checkStatus = "checked"
                        strikethrough = "line-through"
                    } else {
                        checkStatus = ''
                        strikethrough = ''
                    }


                    $("#todo-body").append(`
                        <div class="w-full h-auto mx-auto pt-3">
                            <div class="shadow-xl">
                                <div class="tab w-full flex  overflow-hidden rounded-lg bg-gray-600">
                                    <div style="width: 93%">
                                        <input class="absolute opacity-0 " id="todo-${todo.id}" type="radio" name="RadioTodo">

                                         <label class=" block p-5 text-gray-200 ${strikethrough}" for="todo-${todo.id}">
                                         <input class ="p-10 transform scale-125" type="checkbox" id="check-todo-${todo.id}" ${checkStatus} value="${todo.id}" 
                                         onChange="changeStatus(${todo.id})"> &nbsp; ${todo.title} <span
                                         class=" h-4 p-1 mr-2 text-xs text-gray-100 ${badge_color} rounded-full">${due_notes}</span></label>

                                        <div class="tab-content overflow-hidden  bg-gray-300 text-gray-700 ">
                                            <input id="title-${todo.id}" type="text"
                                                class="form-control w-full px-5 pt-2 pb-2 overflow-hidden bg-gray-300 text-gray-500 "
                                                placeholder="Title here ..." value="${todo.title}" onchange="editTitle(this.value, ${todo.id})" /> 
                                        </div>

                                        <div class="tab-content overflow-hidden h-24 bg-gray-200 text-gray-700 ">
                                            <textarea  id="description-${todo.id}" type="textarea"
                                                class="form-control w-full items-start h-24 px-10 pt-2 overflow-hidden bg-gray-200 text-gray-500 "
                                                placeholder="Description here ..." onchange="editDescription(this.value, ${todo.id})">${todo.description}</textarea>
                                        </div>
                                  
                                        <div class="flex tab-content overflow-hidden bg-gray-200 text-gray-700">
                                            <label class="w-2/10 px-10 pt-2 text-gray-500">Due:</label>
        
                                            <input id="due_date-${todo.id}" class="form-control pt-1 overflow-hidden bg-gray-200 text-gray-500 "
                                                type="date" value="${todo.due_date}" min="${today}" onchange="editDueDate(this.value, ${todo.id})">
                                         </div>

                                </div>
                                    <div style="width: 7%" class="flex  text-2xl">
                                        <button class="py-4 px-1 text-gray-400 hover:text-gray-200" onClick="deleteTodos(${todo.id})" title="Delete"><i
                                                class="mdi mdi-trash-can-outline"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                `)
                })
            }

            var myRadios = document.getElementsByName('RadioTodo');
            var setCheck;
            var x = 0;
            for (x = 0; x < myRadios.length; x++) {
                myRadios[x].onclick = function () {
                    if (setCheck != this) {
                        setCheck = this;
                    } else {
                        this.checked = false;
                        setCheck = null;
                    }
                };
            }


        })
        .fail(err => {
            console.log(err)
        });
}

function deleteTodos(idTodo) {
    $.ajax({
        type: "DELETE",
        url: "http://localhost:3000/todos/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
    })
        .done(({ count, result }) => {
            fetchTodos();
        })
        .fail(err => {
            console.log(err)
        });
}

//////////////////////////////////////////////////// ga jadi dipakai
// function editTodos(idTodo) {
//     let title = $("#title-" + idTodo).val();
//     let description = $("#description-" + idTodo).val();
//     let due_date = $("#due_date-" + idTodo).val();
//     let status = "Closed";

//     $.ajax({
//         type: "PUT",
//         url: "http://localhost:3000/todos/" + idTodo,
//         headers: {
//             token: localStorage.getItem("token"),
//         },
//         data: {
//             title,
//             description,
//             due_date,
//             status
//         }
//     })
//         .done(({ count, result }) => {
//             fetchTodos();
//         })
//         .fail(err => {
//             $("#error-edit").text(err.responseJSON.error);
//             document.getElementById('myModal').showModal()
//         });
// }


function addForm() {
    let today = new Date().toISOString().slice(0, 10);
    $("#new-due_date").val(today)
    $("#new-due_date").attr("min", today);

    document.getElementById('addModal').showModal()
}

function showDashboard() {
    let user, open, closed

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/dash_user",
        headers: {
            token: localStorage.getItem("token"),
        },
    })
        .done(({ result }) => {
            user = result
            //console.log(user);

            $.ajax({
                type: "GET",
                url: "http://localhost:3000/dash_open",
                headers: {
                    token: localStorage.getItem("token"),
                },
            })
                .done(({ result }) => {
                    open = result

                    $.ajax({
                        type: "GET",
                        url: "http://localhost:3000/dash_closed",
                        headers: {
                            token: localStorage.getItem("token"),
                        },
                    })
                        .done(({ result }) => {
                            closed = result


                            let prefix = `https://quickchart.io/chart?chart={
                                type: 'horizontalBar',
                                data: {
                                    labels: [${user}],
                                    datasets: [
                                        {
                                            label: 'Closed',
                                            data: [${closed}],
                                            backgroundColor: 'rgba(147, 197, 253, 0.5)',
                                            borderColor: 'rgb(54, 162, 235)',
                                            borderWidth: 1,
                                        },
                                        {
                                            label: 'Open',
                                            data: [${open}],
                                            backgroundColor: 'rgba(248, 113, 113, 0.5)',
                                            borderColor: 'rgb(54, 162, 235)',
                                            borderWidth: 1,
                                        },
                                    ],
                                },
                                options: {
                                    plugins: {
                                        datalabels: {
                                            anchor: 'center',
                                            align: 'top',
                                            backgroundColor: 'rgba(209, 213, 219, 1)',
                                            borderColor: 'rgba(75, 85, 99, 1)',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                        },
                                    },
                                    scales: {
                                        xAxes: [{
                                            stacked: true,
                                            ticks: {
                                                precision: 0
                                              }
                                        }],
                                        yAxes: [{
                                            stacked: true,
                                            ticks: {
                                                precision: 0
                                              }
                                        }]
                                    }
                                },
                            }&backgroundColor=#E5E7EB&width=600&height=400&devicePixelRatio=1.0&format=png&version=2.9.3`

                            console.log(prefix);
                            $("#img_dashboard").attr("src", prefix);
                            document.getElementById('dashModal').showModal()


                        })
                        .fail(err => {
                            console.log(err)
                        });
                })
                .fail(err => {
                    console.log(err)
                });
        })
        .fail(err => {
            console.log(err)
        });


}

function addTodos() {
    let title = $("#new-title").val();
    let description = $("#new-description").val();
    let due_date = $("#new-due_date").val();
    let status = "Open";
    let msg = ''

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/todos",
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            title,
            description,
            due_date,
            status
        },
    })
        .done((data) => {
            $("#new-title").val("");
            $("#new-description").val("");
            $("#new-due_date").val("");
            $("#error-add").val("");

            document.getElementById('addModal').close()

            fetchTodos();
        })
        .fail((err) => {
            console.log(err);
            err.responseJSON.error.forEach(e => {
                msg = msg + " - " + e + "\n"
            })
            $("#error-add").val(msg);
        })
}

function closeAddTodos() {
    $("#new-title").val("");
    $("#new-description").val("");
    $("#new-due_date").val("");
    $("#error-add").val("");
    document.getElementById('addModal').close()
}

function changeStatus(idTodo) {
    let whichCheckbox = "#check-todo-" + idTodo
    let status = ''

    if ($(whichCheckbox).prop('checked')) {
        status = 'Closed'
    } else {
        status = 'Open'
    }

    $.ajax({
        type: "PATCH",
        url: "http://localhost:3000/todos/status/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            status
        }
    })
        .done(data => {
            fetchTodos();
        })
        .fail(err => {
            console.log(err)
        });
}

function editTitle(title, idTodo) {
    $.ajax({
        type: "PATCH",
        url: "http://localhost:3000/todos/title/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            title
        }
    })
        .done(data => {
            fetchTodos();
        })
        .fail(err => {
            $("#error-edit").text(err.responseJSON.error);
            document.getElementById('myModal').showModal()
        });
}

function editDescription(description, idTodo) {
    $.ajax({
        type: "PATCH",
        url: "http://localhost:3000/todos/description/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            description
        }
    })
        .done(data => {
            fetchTodos();
        })
        .fail(err => {
            $("#error-edit").text(err.responseJSON.error);
            document.getElementById('myModal').showModal()
        });
}

function editDueDate(due_date, idTodo) {
    $.ajax({
        type: "PATCH",
        url: "http://localhost:3000/todos/due_date/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            due_date
        }
    })
        .done(data => {
            fetchTodos();
        })
        .fail(err => {
            $("#error-edit").text(err.responseJSON.error);
            document.getElementById('myModal').showModal()
        });
}

function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    let id_token = googleUser.getAuthResponse().id_token;

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/login_google",
        data: {
            token: id_token
        }
    })
        .done((data) => {
            localStorage.token = data.token;
            //   localStorage.setItem("token", data.token);

            afterLogin();
        })
        .fail((err) => {
            console.log(err);
            // $("#error-login").text(err.responseJSON.error);
        })

}