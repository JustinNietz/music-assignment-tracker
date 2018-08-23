'use strict';
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
                lastName: $("#lastName").val(),
                isAdmin: $('input[name=isAdmin]:checked').val() 
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
    $('form[name=login]').submit(function(e){
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
    function success(response){
        $.ajax({
            type: "GET",
            url: '/api/users',
            success: successful,
//need to only get the data user is calling for 
            
        })
        function successful(success){
            for(let i = 0; i < success.length; i++){
                if(success[i].username === ($('#username').val()) && success[i].isAdmin === true){
                    $.ajax({
                        type: "GET",
                        url: '/api/protected',
                        headers: {
                        Authorization: `Bearer ${response.authToken}`
                        },
                        success: function work(success){
                         
                           
                            loadDashboardTeacher();
                        },
                    
                    }) 
                } else {
                    $.ajax({
                        type: "GET",
                        url: '/api/protected',
                        headers: {
                        Authorization: `Bearer ${response.authToken}`
                        },
                        success: function work(success){
                    
                           
                            loadDashboardStudent();
                        },
                    
                    }) 
                }
                
            }
           
          
       
            
        }

        
    } 
    function error(err){
      
        if(err.status == '401'){
        console.log('Username or Password incorrect');
        }
    }   
})

function loadDashboardTeacher(){
    const dashboard = `
    <h2>Welcome to your dashboard!</h2>
    `
$('.form-js').remove();
$('.dashboard-js').html(dashboard);
}


function loadDashboardStudent(){
    const dashboard = `
    <h2>Welcome to your dashboard!</h2>
    <p>Student login</p>
    <p>Assignments</p>
    <h4 class="Assignment1"></h4>
    `
$('.form-js').remove();
$('.dashboard-js').html(dashboard);
}