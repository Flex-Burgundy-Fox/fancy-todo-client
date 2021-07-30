$(document).ready(function () {
    if (localStorage.getItem("token")) {
        afterLogin();
    } else {
        beforeLogin();
    }

    $("#nav-logout").click(logoutHandler);
    $("#login-form").submit(loginHandler);
    $("#add-form").click(addForm);
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
            $("#error-login").text(err.responseJSON.error);
        })
        .always(() => {
            $("#login-email").val("");
            $("#login-password").val("");
        });
}

function fetchTodos() {
    let due_notes = ''
    let badge_color = ''

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

                    $("#todo-body").append(`
                        <div class="w-full mx-auto pt-5">
                            <div class="shadow-xl">
                                <div class="tab w-full flex  overflow-hidden rounded-lg bg-gray-600">
                                    <div style="width: 88%">
                                        <input class="absolute opacity-0 " id="todo-${todo.id}" type="radio" name="RadioTodo">
                                       
                                        <label class=" block p-5 text-gray-200 " for="todo-${todo.id}">${todo.title} <span
                                        class=" h-4 p-1 mr-2 text-xs text-gray-100 ${badge_color} rounded-full">${due_notes}</span></label>

                                        <div class="tab-content overflow-hidden  bg-gray-300 text-gray-700 ">
                                            <input id="title-${todo.id}" type="text"
                                                class="form-control w-full px-5 pt-2 pb-2 overflow-hidden bg-gray-300 text-gray-500 "
                                                placeholder="Title here ..." value="${todo.title}" /> 
                                        </div>

                                        <div class="tab-content overflow-hidden h-24 bg-gray-200 text-gray-700 ">
                                            <textarea  id="description-${todo.id}" type="textarea"
                                                class="form-control w-full items-start h-24 px-10 pt-2 overflow-hidden bg-gray-200 text-gray-500 "
                                                placeholder="Description here ...">${todo.description}</textarea>
                                        </div>
                                  
                                        <div class="flex tab-content overflow-hidden bg-gray-200 text-gray-700">
                                            <label class="w-2/10 px-10 pt-2 text-gray-500">Due:</label>
        
                                            <input id="due_date-${todo.id}" class="form-control pt-1 overflow-hidden bg-gray-200 text-gray-500 "
                                                type="date" value="${todo.due_date}" min="${todo.today}" max="2023-12-31">
                                         </div>

                                </div>
                                    <div style="width: 12%" class="flex justify-center text-2xl">
                                        <button class="py-4 px-1 text-gray-400 hover:text-gray-200" onClick="deleteTodos(${todo.id})" title="Delete"><i
                                                class="mdi mdi-trash-can-outline"></i></button>
                                        <button class="py-4 px-1 text-gray-400 hover:text-gray-200" onClick="editTodos(${todo.id})" title="Save"><i
                                                class="mdi mdi-content-save-outline"></i></button>
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

function editTodos(idTodo) {
    let title = $("#title-" + idTodo).val();
    let description = $("#description-" + idTodo).val();
    let due_date = $("#due_date-" + idTodo).val();
    let status = "Closed";

    $.ajax({
        type: "PUT",
        url: "http://localhost:3000/todos/" + idTodo,
        headers: {
            token: localStorage.getItem("token"),
        },
        data: {
            title,
            description,
            due_date,
            status
        }
    })
        .done(({ count, result }) => {
            fetchTodos();
        })
        .fail(err => {
            console.log(err.responseJSON.error)
            console.log(err);

            $("#error-edit").text(err.responseJSON.error);
            document.getElementById('myModal').showModal()
        });
}


function addForm() {
    document.getElementById('addModal').showModal()
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

            $("#addModal").hide();

            fetchTodos();
        })
        .fail((err) => {
            err.responseJSON.error.forEach(e => {
                msg = msg + " - " + e + "\n"
            })

            $("#error-add").text(msg);
        })
}

function closeAddTodos() {
    $("#new-title").val("");
    $("#new-description").val("");
    $("#new-due_date").val("");
    $("#error-add").val("");
    document.getElementById('addModal').close()
}