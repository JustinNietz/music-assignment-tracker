'use strict';

function sendSignUp() {
    window.location.href = "sign-up.html";
}

function sendLogin() {
    window.location.href = "login.html";
}
function navDropDown() {
    let x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}


function handleAddItem(){

}

$(function () {

    $('body').submit(function (ev) {
        console.log('CAUGHT A SUBMIT', ev)
        ev.preventDefault();
        const target = $(ev.target)

        // handle each form by name
        if (target.attr('name') === 'js-assignment-list-form') {
            console.log('You clicked ADD item!')
            handleAddItem()
        }
        if (target.attr('name') === 'list-items') {
            console.log('You clicked LIST item!')
        }
    })

    $('form[name=signup]').submit(function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/users',
            data: JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val(),
                firstName: $("#firstName").val(),
                lastName: $("#lastName").val(),
                isAdmin: $('input[name=isAdmin]:checked').val(),
                Assignments: [{
                    assignmentName: 'Okay',
                    assignmentDate: 'and',
                }]
            }),
            success: success,
            error: error,
            contentType: 'application/json'
        });
        return false;
    });
    function success(response) {
        console.log(response)
        window.location.href = "login.html";
    }
    function error(err) {
        $('.js-errorsUser').html(`Username ${err.responseJSON.message}!`);
        $('.js-errorsPass').html(`Password ${err.responseJSON.message}!`);

        if (err.responseJSON.location === "username") {
            $('.js-errorsPass').hide();
            $('.js-errorsUser').show();
        } else if (err.responseJSON.location === "password") {
            $('.js-errorsUser').hide();
            $('.js-errorsPass').show();
        }
    }
});

////////////////////////////////////////

$(function () {
    $('form[name=login]').submit(function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/auth/login',
            data: JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val(),
            }),
            success: success,
            error: error,
            contentType: 'application/json'
        });
        return false;
    });
    function success(response) {
        console.log(response); //authtoken
        $.ajax({
            type: "GET",
            url: `/api/users/`,
            success: successful,

            //need to only get the data user is calling for 

        })
        function successful(success) {
            console.log(success); // json response
            for (let i = 0; i < success.length; i++) {
                if (success[i].username === ($('#username').val())) {
                    $.ajax({
                        type: "GET",
                        url: '/api/users/' + success[i].id,
                        success: function doSomething(success) {
                            if (success.isAdmin === true) {
                                $.ajax({
                                    type: "GET",
                                    url: '/api/protected',
                                    headers: {
                                        Authorization: `Bearer ${response.authToken}`
                                    },
                                    success: function work(successy) {
                                        loadDashboardTeacher();
                                        $('.Greeting').html(`Hello ${success.firstName}!`).show().delay(4900).fadeOut();
                                        $('.teacherDash').html('Teacher Dashboard').hide().delay(5000).fadeIn();
                                        $.ajax({
                                            type: "GET",
                                            url: '/api/users',
                                            success: function assignments(successfully) {
                                                $('.Assignments').html(`${success.Assignments}`)
                                                console.log(success.Assignments)
                                            }
                                        })
                                    },

                                })
                            } else {
                                $.ajax({
                                    type: "GET",
                                    url: '/api/protected',
                                    headers: {
                                        Authorization: `Bearer ${response.authToken}`
                                    },
                                    success: function work(successo) {

                                        loadDashboardStudent();
                                        $('.Greeting').html(`Hello ${success.firstName}!`).show().delay(5000).fadeOut();
                                    },

                                })
                            }
                        }

                    })
                }
            }
        }


    }
    function error(err) {

        if (err.status == '401') {
            $('.js-errorIncorrect').html('Username or Password incorrect');
        }
    }
})
/////////////////////////////////////

function loadDashboardTeacher() {
    const dashboard = `
    <h2 class="Greeting"></h2>
    <div class="row">
        <div class="col-12">
            <h2 class="teacherDash"></h2>
        </div>
    </div>
        <form class="assignmentForm" name="js-assignment-list-form">
            <label for="assignment-list-entry">Username</label>
            <input type="text" class="forDashboard" name="assignment-list-entry">
            
            <label for="assignment-list-entry">Assignment Name</label>
            <input type="text" class="forDashboard" name="shopping-list-entry" placeholder="Assignment #1">
          
            <label for="assignment-list-entry">Date</label>
            <input type="date" class="forDashboard forDates" name="assignment-list-entry">

            <button type="submit" class="submitAssignment">Add item</button>
        </form>
       
    <ul class="assignmentList">
      <li class="showAssignment">
        <span class="username"></span>
        <span class="Assignments"></span>
        <div class="">
          <button class="assignment-item-update">
            <span class="button-label">update</span>
          </button>
          <button class="assignment-item-delete">
            <span class="button-label">delete</span>
          </button>
        </div>
      </li>
    </ul>
  </div>

    `
    $('.formRemove-js').remove();
    $('.dashboard-js').html(dashboard);

}


function loadDashboardStudent() {
    const dashboard = `
    <h3 class="Greeting"></h3>
    <p>Student login</p>
    
    <p>Assignments</p>
    <h4 class="Assignments1"></h4>
    `
    $('.formRemove-js').remove();
    $('.dashboard-js').html(dashboard);
}