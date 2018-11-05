const STATE = {
    users: [],
    loggedInUser: null,
}

function loadUsers() {

    // return a promise
    return $.ajax({
        type: "GET",
        url: '/api/users',
    }).then(usersArr => {
        STATE.users = usersArr
    })
}

function getStudents() {
    return STATE.users.filter(user => !user.isAdmin)
}

function getAssignmentByID(userObj, id) {
    const assgns = userObj.Assignments
    const filtered = assgns.filter(a => a.id === id)
    if (!filtered.length) {
        return null
    }
    return filtered[0]
}

function getUserByID(id) {
    const filtered = STATE.users.filter(user => user.id === id)
    if (!filtered.length) {
        return null
    }
    return filtered[0]
}

function addAssignment(userID, data) {
    const userObj = getUserByID(userID)
    return $.ajax({
        type: "POST",
        url: '/api/users/createassignment/' + userID,
        data: JSON.stringify(data),
        headers: {
            Authorization: `Bearer ${APP.LOGIN_INFO.authToken}`
        },
        success: function display(userObj) {
            displayAssignments(userObj)
        },
        contentType: 'application/json'
    })
}

function setupAddButton() {
    $('body').on('click', '.submitAssignment', ev => {

        //TODO validate here
        const data = {
            assignmentName: $("#js-assignment-name").val(),
            assignmentDate: $("#js-assignment-date").val()
        }
        const userID = $('#username').val()
        addAssignment(userID, data)
    })
}

function populateSelect() {
    const students = getStudents()
    const list = [`<option value="">Please select </option>`];
    for (let i = 0; i < students.length; i++) {
        list.push(`<option value="${students[i].id}">${students[i].username}</option>`);
    }
    $(".showStudents-js").html(list);
}

function setupUserSelect() {
    $('body').on('change', '#username', ev => {

        const userID = $('#username').val()
        const userObj = getUserByID(userID)
        displayAssignments(userObj)
        $(".showStudents-js").show();
    })
}


function displayAssignments(userObj) {

    $('.showAssignment').empty();

    $('.showAssignment').append(`<h3>${userObj.username}</h3>`);
    for (let j = 0; j < userObj.Assignments.length; j++) {
        const assgn = userObj.Assignments[j]
        const formNameID = `assignment-list-entry-${assgn.id}`
        const formDateID = `assignment-list-entry-${assgn.id}`
        $('.showAssignment').append(`
    <li
    data-user-id="${userObj.id}" 
    data-id="${assgn.id}"
    >
    <span>Assignment: <b class="assignmentColor">${userObj.Assignments[j].assignmentName}</b> Due Date: <b class="assignmentColor">${userObj.Assignments[j].assignmentDate}</b></span>
    
    <button class="assignment-item-delete button-label">Delete</button>
    <button class="js-show-hide-edit-form button-label">Edit</button>    
    <form class="js-hidden">
        <label for="${formNameID}">Assignment Name</label>
        <input type="text" class="js-edit-name forDashboard" id="${formNameID}" placeholder="Assignment #1">      
        <label for="${formDateID}">Date</label>
        <input type="date" class="js-edit-date forDashboard forDates" id="${formDateID}">
        <button class="assignment-item-update button-label">Save</button>
    </form>    

    </li>`);
    }
}

function setupShowHideEditForm() {
    $('body').on('click', '.js-show-hide-edit-form', ev => {
        ev.preventDefault()
        const btn$ = $(event.target)
        const form$ = btn$.parent().find('form')
        form$.toggleClass('js-hidden')

        const userID = $(btn$).parents('li').attr('data-user-id')
        const assgnID = $(btn$).parents('li').attr('data-id')
        const userObj = getUserByID(userID)
        const assgnObj = getAssignmentByID(userObj, assgnID)

        form$.find('.js-edit-name').val(assgnObj.assignmentName)
        form$.find('.js-edit-date').val(assgnObj.assignmentDate)


        // debugger
    })
}

function saveAssignment(userID, assgnObj) {
    return $.ajax({
        contentType: 'application/json',
        type: "PUT",
        url: '/api/users/' + userID,
        data: JSON.stringify({ assignment: assgnObj }),
        headers: {
            Authorization: `Bearer ${APP.LOGIN_INFO.authToken}`
        },
    })
}
function clickedEditButton() {
    $('body').on('click', '.assignment-item-update', ev => {
        ev.preventDefault()
        setupEditButtons()
    })
}
function setupSaveEditsButtons() {
    $('body').on('click', '.assignment-item-update', ev => {
        ev.preventDefault()
        const form$ = $(ev.target).parents('form')
        const userID = $(ev.target).parents('li').attr('data-user-id')
        const assgnID = $(ev.target).parents('li').attr('data-id')
        const userObj = getUserByID(userID)
        const assgnObj = Object.assign({}, getAssignmentByID(userObj, assgnID))
        const assgnName = form$.find('.js-edit-name').val()
        const assgnDate = form$.find('.js-edit-date').val()
        assgnObj.assignmentName = assgnName
        assgnObj.assignmentDate = assgnDate
        
        //assgnObj.assignmentName = assgnObj.assignmentName + ' edited ' //this needs to be a inputted value
        saveAssignment(userID, assgnObj).then(newUserObj => {
            userObj.Assignments = newUserObj.Assignments
            displayAssignments(userObj)
        })
    })
}

function saveDeletedAssignment(userID, assgnObj){
    return $.ajax({
        contentType: 'application/json',
        type: "DELETE",
        url: '/api/users/' + userID,
        data: JSON.stringify({ assignment: assgnObj }),
        headers: {
            Authorization: `Bearer ${APP.LOGIN_INFO.authToken}`
        },
    })
}
function setupDeleteButtons() {
    $('body').on('click', '.assignment-item-delete', ev => {
        ev.preventDefault()
        const form$ = $(ev.target).parents('form')
        const userID = $(ev.target).parents('li').attr('data-user-id')
        const assgnID = $(ev.target).parents('li').attr('data-id')
        const userObj = getUserByID(userID)
        const assgnObj = Object.assign({}, getAssignmentByID(userObj, assgnID))
        const assgnName = form$.find('.js-edit-name').val()
        const assgnDate = form$.find('.js-edit-date').val()
        assgnObj.assignmentName = assgnName
        assgnObj.assignmentDate = assgnDate
        
        //assgnObj.assignmentName = assgnObj.assignmentName + ' edited ' //this needs to be a inputted value
        saveDeletedAssignment(userID, assgnObj).then(newUserObj => {
            userObj.Assignments = newUserObj.Assignments
            displayAssignments(userObj)
        })
    })
}
$(() => {
    loadUsers().then(() => {
        setupAddButton()
        setupUserSelect()
        setupSaveEditsButtons()
        populateSelect()
        setupShowHideEditForm()
        setupDeleteButtons()

        //displayAssignments()
        // debugger
    })
})


// finish edit button
//make delete work
