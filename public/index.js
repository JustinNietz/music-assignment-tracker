$(function(){
    $('form[name=signup]').submit(function(e){
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/users',
            data: JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val(),
                firstName: $("#firstName").val(),
                lastName: $("#lastName").val()
             }),
            success: success,
            error: error,
            contentType: 'application/json'
          });
        return false;
    });
    function success(response){
        console.log(response)
        window.location.href="login.html";
    }
    function error(err){
        $('.error-js').html(`${err.responseJSON.location} ${err.responseJSON.message}`);
        console.log(`${err.responseJSON.location} ${err.responseJSON.message}`)
    }
  });

$(function(){
    $('form[name=login').submit(function(e){
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/auth/login',
            data: JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val()
            }),
            success: success,
            error: error,
            contentType: 'application/json'
        });
        return false;
    });
    function success(response){
        $.ajax({
            type: "GET",
            url: '/api/protected',
            headers: {
            Authorization: `Bearer ${response.authToken}`
            },
            success: function work(success){
                console.log(success);
                loadDashboard();
            }
        
        })   
    }
    function error(err){
       // $('.error-js').html(`${err.responseJSON.location} ${err.responseJSON.message}`);
        console.log(err)
    }   
})

function loadDashboard(){
    const dashboard = `
    <h2>Welcome to your dashboard!</h2>
    `
$('.form-js').remove();
$('.dashboard-js').html(dashboard);
}