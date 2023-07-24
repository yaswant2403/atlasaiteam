// Loading in All Intern Data into Table
const table_body = document.querySelector('#admin-data');
const no_admin = document.querySelector('#no-admin-alert');

/**
 * @param {Array} admin_arr - an array of admins we need to append to the table
 * Appends all the admins in admin_arr to the table_body
 */
function appendToTable(admin_arr) {
    table_body.textContent = ''; // clear the current table since this function is called multiple times when using pagination
    while (admin_arr.length > 0) {
        var admin = admin_arr.pop();
        var user_data = JSON.stringify(admin);
        const tr = document.createElement('tr');
        tr.setAttribute('data-name', admin.name);
        tr.innerHTML = `
            <td>${admin.net_id}</td>
            <td>${admin.name}</td>
            <td>${admin.term}</td>
            <td>${admin.roles.join(', ')}</td>
            <td>${admin.updatedBy}</td>
            <td>${admin.updatedDate.substring(0,10).concat(" ", admin.updatedDate.substring(11,19))}</td>
            <td class="text-center">
                <span data-toggle="tooltip" data-placement="top" title="Edit Admin">
                    <a href="#" class="pl-4 pr-4 edit-admin" data-user='${user_data}'><i class="fas fa-edit link-info"></i></a>
                </span>
            </td>
        `;
        table_body.appendChild(tr);
    }
}

/**
 * Loads the table by grabbing all the admin from the database
 * Also includes pagination logic showing only 15 admin at once
*/
async function loadTable() {
    no_admin.style.display = 'none'; // hide the alert if visible
    table_body.textContent = ''; //clear the current table
    const allAdmin = await fetch('/all-admin', {  // from server
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    const admin = await allAdmin.json();
    const totalPages = Math.ceil(admin.length/15); 
    const pagination = $('#page-selection').bootpag({
        total: totalPages, // 15 admin on each page
        page: 1, // always start with page 1
        firstLastUse: true, // used to get FIRST and END buttons working
        first: '⇤',
        last: '⇥',
        maxVisible: 5
    })
    $("#page-selection li").addClass('page-item');
    $("#page-selection a").addClass('page-link');
    if (allAdmin.ok) {
        if (admin[0].net_id == null) { // no admin found
            no_admin.style.display = null;
        } else {
            // if there are <=15 admin
            if (totalPages == 1) {
                appendToTable(admin);
            }
            // if there are > 15 admin, split them up into groups of 15 or less.
            if (totalPages > 1) {
                const first15 = admin.slice(0, 15);
                appendToTable(first15); // on window load, display only the first 15
                pagination.on('page', function(e, pg_num) {
                    if (pg_num == 1) {
                        appendToTable(admin.slice(0, 15));
                    } else {
                        // if the arr > 15 * pg_num, then add the multiple of 15 to current page and add the rest to the next page
                        // otherwise add the remaining of arr to the current page.
                        const overflow = (15 * pg_num) - admin.length;
                        if (overflow >= 0) {
                            const admin_group = admin.slice((pg_num - 1) * 15, admin.length);
                            appendToTable(admin_group);
                        } else {
                            const admin_group = admin.slice((pg_num - 1) * 15, pg_num * 15);
                            appendToTable(admin_group);
                        }
                    }
                })
            }
        }
    } else {
        const errMessage = await allAdmin.json();
        no_admin.style.display = null;
        no_admin.innerText = errMessage.error + " Please refresh the page again.";
    }
}

window.onload = loadTable();

// grabbing the forms
const addForm = document.querySelector('#new-admin');
const editForm = document.querySelector('#edit-admin-form');
const cls = ['was-validated', 'alert-success', 'alert-danger'];

$(document).ready(function() {
    // search function
    $('#search').on("keyup", function() {
        var search_term = $(this).val().toLowerCase();
        $('#admin-data tr').filter(function() {
            var admin_name = $(this).attr('data-name').toLowerCase();
            $(this).toggle(admin_name.includes(search_term));
        })
    })
    /**
     * Manually toggling modals because using data-target/dismiss doesn't work well with our logic of verification.
     */ 
    // all the following code ensures the modal is back to default everytime user clicks on Add Admin
    $('#add-admin-btn').click(_ => {
        $('#add-admin').modal('toggle');
        addForm.reset();
        addForm.classList.remove(...cls);
        document.querySelector('#add-admin .filter-option-inner-inner').innerText = "Admin";
        document.querySelector('#add-modal-body').style.opacity = '1';
        document.querySelector('#loading').style.display = 'none';
        document.querySelector('#loading-text').style.display = 'none';
        document.querySelector('#add-alert').style.display = 'none';
        document.querySelector('#add-alert').classList.remove(...cls);
        document.querySelector('#continue-add').style.display = null;
    })
    // close manual toggles 
    $('.close-add').click(_ => {
        $('#add-admin').modal('toggle');
    })
    $('.close-add-modal-btn').click(_ => {
        $('#add-admin').modal('toggle');
    })
    $('.close-edit').click(_ => {
        $('#edit-admin-modal').modal('toggle');
    })
    $('.close-edit-modal-btn').click(_ => {
        $('#edit-admin-modal').modal('toggle');
    })
    // toggle edit user modal
    $(document).on('click', '.edit-admin', function() {
        var user = $(this).attr('data-user')
        $('#edit-admin-modal').attr("data-user", user).modal('toggle');
        editForm.reset();
        document.querySelector('#edit-admin-modal .filter-option-inner-inner').innerText = "Admin";
        editForm.classList.remove(...cls);
        document.querySelector('#edit-modal-body').style.opacity = '1';
        document.querySelector('#edit-loading').style.display = 'none';
        document.querySelector('#edit-loading-text').style.display = 'none';
        document.querySelector('#edit-alert').style.display = 'none';
        document.querySelector('#edit-alert').classList.remove(...cls);
    });
    // displays all users data in the edit form
    $('#edit-admin-modal').on('shown.bs.modal', function() {
        var modal = $(this);
        var user = JSON.parse(modal.attr('data-user'));
        var user_title = 'Edit ATLAS Admin: ' + user.name;
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
        $('#editRoles').val(user.roles);
        document.querySelector('#edit-admin-modal .filter-option-inner-inner').innerText = user.roles.join(", ");
    })
});


// getting all the new admin form inputs
function getNewAdminInputs() {
    const net_id = document.querySelector('#newNetID').value.trim();
    const name = document.querySelector('#inputFirstName').value.trim() + ' ' +
        document.querySelector('#inputLastName').value.trim();
    const term = document.querySelector('#inputTerm').value + 
        document.querySelector('#inputYear').value;
    var roles = ['Admin'];
    roles = roles.concat($('#inputRoles').val());
    return {
        net_id: net_id,
        name: name,
        term: term,
        roles: roles
    };
}

// getting all the edit form inputs
function getEditAdminInputs() {
    const net_id = document.querySelector('#editNetID').value.trim();
    const name = document.querySelector('#editFirstName').value.trim() + ' ' +
        document.querySelector('#editLastName').value.trim();
    const term = document.querySelector('#editTerm').value + 
        document.querySelector('#editYear').value;
    var roles = ['Admin'];
    roles = roles.concat($('#editRoles').val());
    return {
        net_id: net_id,
        name: name,
        term: term,
        roles: roles
    };
}

// submit handler for Adding Admin Form
const handleAddSubmit = async (e) => {
    e.preventDefault();
    const add_alert = document.querySelector('#add-alert');
    add_alert.classList.remove(...cls);
    add_alert.classList.display = 'none';
    add_alert.innerText = null;
    if (!addForm.checkValidity()) {
        console.log("Form is Invalid!");
        addForm.classList.add('was-validated');
    } else {
        addForm.classList.remove('was-validated');
        const allInputs = getNewAdminInputs();
        const warning_message = "Are you sure you want to add " + allInputs.name + 
            " and grant them the following roles: " + allInputs.roles.join(" ") + "?";
        if(confirm(warning_message)) {
            // loading animation enabled
            document.querySelector('#loading').style.display = null;
            document.querySelector('#loading-text').style.display = null;
            document.querySelector('#add-modal-body').style.opacity = '0';
            const add_admin_response = await fetch('/add-admin', {  // from server
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(allInputs) 
            })
            if (add_admin_response.ok) {
                document.querySelector('#loading').style.display = 'none';
                document.querySelector('#loading-text').style.display = 'none';
                document.querySelector('#add-modal-body').style.opacity = '1';
                const result = await add_admin_response.json();
                addForm.reset();
                add_alert.classList.add('alert-success');
                add_alert.innerText = result.message;
                add_alert.style.display = null;
                document.querySelector('#continue-add').style.display = 'none';
                loadTable(); // load the table again
            } else {
                document.querySelector('#loading').style.display = 'none';
                document.querySelector('#loading-text').style.display = 'none';
                document.querySelector('#add-modal-body').style.opacity = '1';
                const result = await add_admin_response.json();
                add_alert.classList.add('alert-danger');
                add_alert.innerText = result.message;
                add_alert.style.display = null;
            }
        }
    }
}

// submit handler for Editing Admin Form
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
        const allInputs = getEditAdminInputs();
        const edit_admin_response = await fetch('/edit-admin', {  // from server
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(allInputs) 
        })
        if (edit_admin_response.ok) {
            document.querySelector('#edit-loading').style.display = 'none';
            document.querySelector('#edit-loading-text').style.display = 'none';
            document.querySelector('#edit-modal-body').style.opacity = '1';
            const result = await edit_admin_response.json();
            edit_alert.classList.add('alert-success');
            edit_alert.innerText = result.message;
            edit_alert.style.display = null;
            loadTable(); // update the table
        } else {
            document.querySelector('#edit-loading').style.display = 'none';
            document.querySelector('#edit-loading-text').style.display = 'none';
            document.querySelector('#edit-modal-body').style.opacity = '1';
            const result = await edit_admin_response.json();
            edit_alert.classList.add('alert-danger');
            edit_alert.innerText = result.message;
            edit_alert.style.display = null;
        }
    }
}

// Using our handleSubmitFunctions as the function for the submit eventListeners of these forms
addForm.addEventListener('submit', handleAddSubmit, false);
editForm.addEventListener('submit', handleEditSubmit, false);