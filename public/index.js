'use strict';

// initial app state
const APP = {
    LOGIN_INFO: {},
    lastAssignments: []
}

//Reloads page to the sign-up screen
const sendSignUp = () => {
    window.location.href = "sign-up.html";
};

//Reloads page to the login screen
const sendLogin = () => {
    window.location.href = "login.html";
};

//Mobile responsive navigation bar
const navDropDown = () => {
    let x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
};

//To sign up for an account
const signUpForm = () => {
    //First, a POST request with values the user inputs
    $.ajax({
        type: "POST",
        url: '/api/users',
        data: JSON.stringify({
            username: $("#username").val(),
            password: $("#password").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            isAdmin: $('input[name=isAdmin]:checked').val(),
            // Assignments will be added by an admin user later
            Assignments: [{
                assignmentName: '',
                assignmentDate: '',
            }]
        }),
        // if there is a successful sign up, switch pages to login.html
        success: function success(response) {
            console.log(response) //JWT
            window.location.href = "login.html";
        },
        //if there is an error, show the error on the sign up form
        error: function error(err) {
            $('.js-errorsUser').html(`Username ${err.responseJSON.message}!`);
            $('.js-errorsPass').html(`Password ${err.responseJSON.message}!`);

            if (err.responseJSON.location === "username") {
                $('.js-errorsPass').hide();
                $('.js-errorsUser').show();
            } else if (err.responseJSON.location === "password") {
                $('.js-errorsUser').hide();
                $('.js-errorsPass').show();
            }
        },
        contentType: 'application/json'
    });
    return false;
};

//To login to an account. Reloads page based on if you are an admin or not
const loginForm = () => {
    //POST username and password in exchange for a JWT token
    $.ajax({
        type: "POST",
        url: '/api/auth/login',
        data: JSON.stringify({
            username: $("#username").val(),
            password: $("#password").val(),
        }),
        contentType: 'application/json',
        success: function success(response) {
            // response is the JWT of the logged in user
            APP.LOGIN_INFO = response;
            saveLoginToken();
            const redirectURL = APP.LOGIN_INFO.isAdmin ? '/dash-teacher.html' : 'student-dash.html'
            if (window.location.pathname !== redirectURL) {
                window.location.href = redirectURL
            }
            return
        },
        error: function error(err){
            $('.js-errorIncorrect').html('Username or Password is incorrect!');
        }
    })
};

//To save the JWT token as a cookie 
const saveLoginToken = () => {
    Cookies.set('APP_TOKEN', JSON.stringify(APP.LOGIN_INFO));
};

//To restore the login when page is reloaded.
const restoreLoginToken = () => {
    const savedTokenJSONStr = Cookies.get('APP_TOKEN')
    if (savedTokenJSONStr) {
        APP.LOGIN_INFO = JSON.parse(savedTokenJSONStr);
        console.log('LOGIN RESTORED, APP IS NOW', APP);
        const redirectURL = APP.LOGIN_INFO.isAdmin ? '/dash-teacher.html' : '/student-dash.html'
        if (window.location.pathname !== redirectURL) {
            window.location.href = redirectURL
        }
    } else {
        const unathorizedURLs = ['/login.html', '/sign-up.html', '/index.html']

        if (!unathorizedURLs.includes(window.location.pathname)) {
            window.location.href = '/index.html'
        }
    }
};

//enables cookie removal to logout
function logoutFeature() {
    Cookies.remove('APP_TOKEN');
}

//For all form submissions
$(function () {

    console.log('APP STARTS', new Date().toLocaleTimeString())
    restoreLoginToken();
    $('body').submit(function (ev) {
        ev.preventDefault();
        const target = $(ev.target)

        //Sign up form submission    
        if (target.attr('name') === 'signup') {
            signUpForm();
        }
        //Login form submission
        if (target.attr('name') === 'login') {
            loginForm();
        }

        //Deleting list item
        if (target.attr('name') === 'list-items') {
            console.log('You clicked LIST item!')
        }
    })
});