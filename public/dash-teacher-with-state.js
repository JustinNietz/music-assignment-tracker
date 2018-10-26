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

function getUserByID(id) {
    const filtered = STATE.users.filter(user => user.id === id)
    if (!filtered.length) {
        return null
    }
    return filtered[0]
}

function addAssignment(userID, data) {
    return $.ajax({
        type: "POST",
        url: '/api/users/createassignment/' + userID,
        data: JSON.stringify(data),
        headers: {
            Authorization: `Bearer ${APP.LOGIN_INFO.authToken}`
        },
    })
}

function setupAddButton() {
    $('body').on('click', '.submitAssignment', ev => {
        ev.preventDefault()

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
    const list = [];
    for (let i = 0; i < students.length; i++) {
        list.push(`<option value="${students[i].id}">${students[i].username}</option>`);
    }
    $(".showStudents-js").html(list);
}

function setupUserSelect() {
    $('body').on('change', '#username', ev => {
        ev.preventDefault()
        const userID = $('#username').val()
        const userObj = getUserByID(userID)
        displayAssignments(userObj)
    })
}


function displayAssignments(userObj) {

    $('.showAssignment').empty();

    $('.showAssignment').append(`<h3>${userObj.username}</h3>`);
    for (let j = 0; j < userObj.Assignments.length; j++) {
        $('.showAssignment').append(`
    <li>
    <span>Assignment: <b class="assignmentColor">${userObj.Assignments[j].assignmentName}</b> Due Date: <b class="assignmentColor">${userObj.Assignments[j].assignmentDate}</b></span>
    <button class="assignment-item-update button-label" data-id="${userObj.Assignments[j].id}">Edit</button>
    <button class="assignment-item-delete button-label" data-id="${userObj.Assignments[j].id}">Delete</button>
    </li>`);
    }
}


$(() => {
    loadUsers().then(() => {
        setupAddButton()
        setupUserSelect()
        populateSelect()

        //displayAssignments()
        // debugger
    })
})

