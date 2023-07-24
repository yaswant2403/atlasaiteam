// Loading in All Intern Data into Table
const table_body = document.querySelector('#intern-data');
const no_interns = document.querySelector('#no-interns-alert');

/**
 * @param {Array} intern_arr - an array of interns we need to append to the table
 * Appends all the interns in intern_arr to the table_body
 */
function appendToTable(intern_arr) {
    table_body.textContent = ''; // clear the current table since this function is called multiple times when using pagination
    while (intern_arr.length > 0) {
        var intern = intern_arr.pop();
        var user_data = JSON.stringify(intern);
        const tr = document.createElement('tr');
        tr.setAttribute('data-name', intern.name);
        tr.innerHTML = `
            <td>${intern.net_id}</td>
            <td>${intern.name}</td>
            <td>${intern.term}</td>
            <td>${intern.roles.join(', ')}</td>
            <td>${intern.attempts} of 3</td>
            <td>${intern.updatedBy}</td>
            <td>${intern.updatedDate.substring(0,10).concat(" ", intern.updatedDate.substring(11,19))}</td>
            <td class="text-center">
                <span data-toggle="tooltip" data-placement="top" title="Edit Intern">
                    <a href="#" class="pl-4 pr-4 edit-intern" data-user='${user_data}'><i class="fas fa-edit link-info"></i></a>
                </span>
                <span data-toggle="tooltip" data-placement="top" title="Delete Intern">
                    <a href="#" class="pr-4 delete-intern" data-user='${user_data}'><i class="fas fa-trash-alt link-danger"></i></a>
                </span>
            </td>
        `;
        table_body.appendChild(tr);
    }
}

/**
 * Loads the table by grabbing all the interns from the database
 * Also includes pagination logic showing only 15 interns at once
*/
async function loadTable() {
    no_interns.style.display = 'none'; // hide the alert if visible
    table_body.textContent = ''; //clear the current table
    const allInterns = await fetch('/all-interns', {  // from server
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    const interns = await allInterns.json();
    const totalPages = Math.ceil(interns.length/15); 
    const pagination = $('#page-selection').bootpag({
        total: totalPages, // 15 interns on each page
        page: 1, // always start with page 1
        firstLastUse: true, // used to get FIRST and END buttons working
        first: '⇤',
        last: '⇥',
        maxVisible: 5
    })
    $("#page-selection li").addClass('page-item');
    $("#page-selection a").addClass('page-link');
    if (allInterns.ok) {
        if (interns[0].net_id == null) { // no interns found
            no_interns.style.display = null;
        } else {
            // if there are <=15 interns
            if (totalPages == 1) {
                appendToTable(interns);
            }
            // if there are > 15 interns, split them up into groups of 15 or less.
            if (totalPages > 1) {
                const first15 = interns.slice(0, 15);
                appendToTable(first15); // on window load, display only the first 15
                pagination.on('page', function(e, pg_num) {
                    if (pg_num == 1) {
                        appendToTable(interns.slice(0, 15));
                    } else {
                        // if the arr > 15 * pg_num, then add the multiple of 15 to current page and add the rest to the next page
                        // otherwise add the remaining of arr to the current page.
                        const overflow = (15 * pg_num) - interns.length;
                        if (overflow >= 0) {
                            const intern_group = interns.slice((pg_num - 1) * 15, interns.length);
                            appendToTable(intern_group);
                        } else {
                            const intern_group = interns.slice((pg_num - 1) * 15, pg_num * 15);
                            appendToTable(intern_group);
                        }
                    }
                })
            }
        }
    } else {
        const errMessage = await allInterns.json();
        no_interns.style.display = null;
        no_interns.innerText = errMessage.error + " Please refresh the page again.";
    }
}

window.onload = loadTable();

// grabbing the forms
const addInternForm = document.querySelector('#new-intern');
const editForm = document.querySelector('#edit-intern-form');
const deleteForm = document.querySelector('#delete-intern-form');
const cls = ['was-validated', 'alert-success', 'alert-danger'];

$(document).ready(function() {
    // search function
    $('#search').on("keyup", function() {
        var search_term = $(this).val().toLowerCase();
        $('#intern-data tr').filter(function() {
            var intern_name = $(this).attr('data-name').toLowerCase();
            $(this).toggle(intern_name.includes(search_term));
        })
    })
    /**
     * Manually toggling modals because using data-target/dismiss doesn't work well with our logic of verification.
     */ 
    // all the following code ensures the modal is back to default everytime user clicks on Add Intern
    $('#add-intern-btn').click(_ => {
        $('#add-intern').modal('toggle');
        addInternForm.reset();
        addInternForm.classList.remove(...cls);
        document.querySelector('#add-intern .filter-option-inner-inner').innerText = "Intern";
        document.querySelector('#add-modal-body').style.opacity = '1';
        document.querySelector('#loading').style.display = 'none';
        document.querySelector('#loading-text').style.display = 'none';
        document.querySelector('#add-alert').style.display = 'none';
        document.querySelector('#add-alert').classList.remove(...cls);
        document.querySelector('#continue-add').style.display = null;
    })
    // close manual toggles 
    $('.close-add').click(_ => {
        $('#add-intern').modal('toggle');
    })
    $('.close-add-modal-btn').click(_ => {
        $('#add-intern').modal('toggle');
    })
    $('.close-edit').click(_ => {
        $('#edit-intern-modal').modal('toggle');
    })
    $('.close-edit-modal-btn').click(_ => {
        $('#edit-intern-modal').modal('toggle');
    })
    $('.close-delete').click(_ => {
        $('#delete-intern-modal').modal('toggle');
    })
    $('.close-delete-modal-btn').click(_ => {
        $('#delete-intern-modal').modal('toggle');
    })
    // toggle edit user modal
    $(document).on('click', '.edit-intern', function() {
        var user = $(this).attr('data-user')
        $('#edit-intern-modal').attr("data-user", user).modal('toggle');
        editForm.reset();
        document.querySelector('#edit-intern-modal .filter-option-inner-inner').innerText = "Intern";
        editForm.classList.remove(...cls);
        document.querySelector('#edit-modal-body').style.opacity = '1';
        document.querySelector('#edit-loading').style.display = 'none';
        document.querySelector('#edit-loading-text').style.display = 'none';
        document.querySelector('#edit-alert').style.display = 'none';
        document.querySelector('#edit-alert').classList.remove(...cls);
    });
    // displays all user's data in the edit form
    $('#edit-intern-modal').on('shown.bs.modal', function() {
        var modal = $(this);
        var user = JSON.parse(modal.attr('data-user'));
        var user_title = 'Edit ATLAS Intern: ' + user.name;
        modal.find('.modal-title').text(user_title);
        document.querySelector('#editNetID').value = user.net_id;
        document.querySelector('#editFirstName').value = user.name.split(" ")[0];
        document.querySelector('#editLastName').value = user.name.split(" ")[1];
        var season = user.term.slice(0, -4);
        if (season == "SU") {
            document.querySelector('#editTerm').value = "Summer";
        } else if (season == "SP") {
            document.querySelector('#editTerm').value = "Spring";
        } else {
            document.querySelector('#editTerm').value = "Fall";
        }
        var year = user.term.slice(-4);
        document.querySelector('#editYear').value = year;
        document.querySelector('#editAttempts').value = user.attempts;
        $('#editRoles').val(user.roles);
        document.querySelector('#edit-intern-modal .filter-option-inner-inner').innerText = user.roles.join(", ");
    })
    //toggle delete user modal
    $(document).on('click', '.delete-intern', function() {
        var user = $(this).attr('data-user')
        $('#delete-intern-modal').attr("data-user", user).modal('toggle');
        deleteForm.reset();
        document.querySelector('#delete-modal-body').style.opacity = '1';
        document.querySelector('#delete-loading').style.display = 'none';
        document.querySelector('#delete-loading-text').style.display = 'none';
        document.querySelector('#delete-alert').style.display = 'none';
        document.querySelector('#delete-alert').classList.remove(...cls);
    });
    // displays all user's data in the delete form
    $('#delete-intern-modal').on('shown.bs.modal', function() {
        var modal = $(this);
        var user = JSON.parse(modal.attr('data-user'));
        var user_title = 'Deleting Intern: ' + user.name;
        modal.find('.modal-title').text(user_title);
        document.querySelector('#deleteNetID').value = user.net_id;
        document.querySelector('label[for="deleteFirstName"] + input').value = user.name.split(" ")[0];
        document.querySelector('label[for="deleteLastName"] + input').value = user.name.split(" ")[1];
        var season = user.term.slice(0, -4);
        if (season == "SU") {
            document.querySelector('label[for="deleteTerm"] + input').value = "Summer";
        } else if (season == "SP") {
            document.querySelector('label[for="deleteTerm"] + input').value = "Spring";
        } else {
            document.querySelector('label[for="deleteTerm"] + input').value = "Fall";
        }
        var year = user.term.slice(-4);
        document.querySelector('label[for="deleteYear"] + input').value = year;
        document.querySelector('label[for="deleteAttempts"] + input').value = user.attempts;
        document.querySelector('label[for="deleteRoles"] + input').value = user.roles.join(", ");
    })
});


// getting all the new intern form inputs
function getNewInternInputs() {
    const net_id = document.querySelector('#newNetID').value.trim();
    const name = document.querySelector('#inputFirstName').value.trim() + ' ' +
        document.querySelector('#inputLastName').value.trim();
    const term = document.querySelector('#inputTerm').value + 
        document.querySelector('#inputYear').value;
    const attempts = document.querySelector('#inputAttempts').value;
    var roles = ['Intern'];
    roles = roles.concat($('#inputRoles').val());
    return {
        net_id: net_id,
        name: name,
        term: term,
        attempts: attempts,
        roles: roles
    };
}

// getting all the edit form inputs
function getEditInternInputs() {
    const net_id = document.querySelector('#editNetID').value.trim();
    const name = document.querySelector('#editFirstName').value.trim() + ' ' +
        document.querySelector('#editLastName').value.trim();
    const term = document.querySelector('#editTerm').value + 
        document.querySelector('#editYear').value;
    const attempts = document.querySelector('#editAttempts').value;
    var roles = ['Intern'];
    roles = roles.concat($('#editRoles').val());
    return {
        net_id: net_id,
        name: name,
        term: term,
        attempts: attempts,
        roles: roles
    };
}

// submit handler for Adding Intern Form
const handleAddSubmit = async (e) => {
    e.preventDefault();
    const add_alert = document.querySelector('#add-alert');
    add_alert.classList.remove(...cls);
    add_alert.classList.display = 'none';
    add_alert.innerText = null;
    if (!addInternForm.checkValidity()) {
        console.log("Form is Invalid!");
        addInternForm.classList.add('was-validated');
    } else {
        addInternForm.classList.remove('was-validated');
        const allInputs = getNewInternInputs();
        const warning_message = "Are you sure you want to add " + allInputs.name + 
            " and grant them the following roles: " + allInputs.roles.join(" ") + "?";
        if(confirm(warning_message)) {
            // loading animation enabled
            document.querySelector('#loading').style.display = null;
            document.querySelector('#loading-text').style.display = null;
            document.querySelector('#add-modal-body').style.opacity = '0';
            const add_intern_response = await fetch('/add-intern', {  // from server
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(allInputs) 
            })
            if (add_intern_response.ok) {
                document.querySelector('#loading').style.display = 'none';
                document.querySelector('#loading-text').style.display = 'none';
                document.querySelector('#add-modal-body').style.opacity = '1';
                const result = await add_intern_response.json();
                addInternForm.reset();
                add_alert.classList.add('alert-success');
                add_alert.innerText = result.message;
                add_alert.style.display = null;
                document.querySelector('#continue-add').style.display = 'none';
                loadTable(); // load the table again
            } else {
                document.querySelector('#loading').style.display = 'none';
                document.querySelector('#loading-text').style.display = 'none';
                document.querySelector('#add-modal-body').style.opacity = '1';
                const result = await add_intern_response.json();
                add_alert.classList.add('alert-danger');
                add_alert.innerText = result.message;
                add_alert.style.display = null;
            }
        }
    }
}

// submit handler for Editing Intern Form
const handleEditSubmit = async (e) => {
    e.preventDefault();
    const edit_alert = document.querySelector('#edit-alert');
    edit_alert.classList.remove(...cls);
    edit_alert.classList.display = 'none';
    edit_alert.innerText = null;
    if (!editForm.checkValidity()) {
        console.log("Form is Invalid!");
        editForm.classList.add('was-validated');
    } else {
        editForm.classList.remove('was-validated');
        // loading animation enabled
        document.querySelector('#edit-loading').style.display = null;
        document.querySelector('#edit-loading-text').style.display = null;
        document.querySelector('#edit-modal-body').style.opacity = '0';
        const allInputs = getEditInternInputs();
        const edit_intern_response = await fetch('/edit-intern', {  // from server
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(allInputs) 
        })
        if (edit_intern_response.ok) {
            document.querySelector('#edit-loading').style.display = 'none';
            document.querySelector('#edit-loading-text').style.display = 'none';
            document.querySelector('#edit-modal-body').style.opacity = '1';
            const result = await edit_intern_response.json();
            edit_alert.classList.add('alert-success');
            edit_alert.innerText = result.message;
            edit_alert.style.display = null;
            loadTable(); // update the table
        } else {
            document.querySelector('#edit-loading').style.display = 'none';
            document.querySelector('#edit-loading-text').style.display = 'none';
            document.querySelector('#edit-modal-body').style.opacity = '1';
            const result = await edit_intern_response.json();
            edit_alert.classList.add('alert-danger');
            edit_alert.innerText = result.message;
            edit_alert.style.display = null;
        }
    }
}

// submit handler for Deleting Intern
const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    const delete_alert = document.querySelector('#delete-alert');
    delete_alert.classList.remove(...cls);
    delete_alert.classList.display = 'none';
    delete_alert.innerText = null;
    // loading animation enabled
    document.querySelector('#delete-loading').style.display = null;
    document.querySelector('#delete-loading-text').style.display = null;
    document.querySelector('#delete-modal-body').style.opacity = '0';
    const delete_intern_response = await fetch('/delete-user', {  // from server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            net_id: document.querySelector('#deleteNetID').value.trim(),
        }) 
    })
    if (delete_intern_response.ok) {
        document.querySelector('#delete-loading').style.display = 'none';
        document.querySelector('#delete-loading-text').style.display = 'none';
        document.querySelector('#delete-modal-body').style.opacity = '1';
        const result = await delete_intern_response.json();
        delete_alert.classList.add('alert-success');
        delete_alert.innerText = result.message;
        delete_alert.style.display = null;
        loadTable(); // update the table
        $('#delete-intern-modal').modal('toggle'); // close the modal since we don't want user to delete non-existent user
    } else {
        document.querySelector('#delete-loading').style.display = 'none';
        document.querySelector('#delete-loading-text').style.display = 'none';
        document.querySelector('#delete-modal-body').style.opacity = '1';
        const result = await delete_intern_response.json();
        delete_alert.classList.add('alert-danger');
        delete_alert.innerText = result.message;
        delete_alert.style.display = null;
    }
}

// Using our handleSubmitFunctions as the function for the submit eventListeners of these forms
addInternForm.addEventListener('submit', handleAddSubmit, false);
editForm.addEventListener('submit', handleEditSubmit, false);
deleteForm.addEventListener('submit', handleDeleteSubmit, false);