// Loading in All Intern Data into Table
const table_body = document.querySelector('#intern-data');
const no_interns = document.querySelector('#no-interns-alert');
// var interns = []; // storing them in a global variable so we don't have to keep fetching them
async function loadTable(firstTime) {
    const allInterns = await fetch('/all-interns', {  // from server
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    const interns = await allInterns.json();
    if (allInterns.ok) {
        if (firstTime) {
            if (interns[0].net_id == null) {
                no_interns.style.display = null;
            } else {
                while (interns.length > 0) {
                    var intern = interns.pop();
                    var user_data = JSON.stringify(intern);
                    const tr = document.createElement('tr');
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
        } else {
            table_body.textContent = '';
            while (interns.length > 0) {
                var intern = interns.pop();
                var user_data = JSON.stringify(intern);
                const tr = document.createElement('tr');
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
    } else {
        const errMessage = await allInterns.json();
        no_interns.style.display = null;
        no_interns.innerText = errMessage.error + " Please refresh the page again.";
    }
}
window.onload = loadTable(true);

// grabbing the forms
const addInternForm = document.querySelector('#new-intern');
const editForm = document.querySelector('#edit-intern-form');
const cls = ['was-validated', 'alert-success', 'alert-danger'];

// manually toggling modals because using data-target/dismiss doesn't work well with our logic of verification
$(document).ready(function() {
    // ensuring the modal is back to default everytime user clicks on Add Intern
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
    $(document).on('click', '.edit-intern', function() {
        var user = $(this).attr('data-user')
        $('#edit-intern-modal').attr("data-user", user).modal('toggle');
        document.querySelector('#edit-intern-modal .filter-option-inner-inner').innerText = "Intern";
        editForm.reset();
    });
    // displays all users data in the form
    $('#edit-intern-modal').on('shown.bs.modal', function(event) {
        var modal = $(this);
        var user = JSON.parse(modal.attr('data-user'));
        var user_title = 'Edit ATLAS Intern : ' + user.name;
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
    //         console.log($(this))
    // var uid = $(this).attr('data-netid');
    // console.log(uid)
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
            const add_intern_response = await fetch('/add-intern', {  // from server
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(allInputs) 
            })
            // loading animation enabled
            document.querySelector('#loading').style.display = null;
            document.querySelector('#loading-text').style.display = null;
            document.querySelector('#add-modal-body').style.opacity = '0';
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
                loadTable();
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

addInternForm.addEventListener('submit', handleAddSubmit, false);

