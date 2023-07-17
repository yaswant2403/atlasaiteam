// Loading in All Intern Data into Table
const table_body = document.querySelector('#intern-data');
const no_interns = document.querySelector('#no-interns-alert');
var interns = []; // storing them in a global variable so we don't have to keep fetching them
const loadTable = async (e) => {
    const allInterns = await fetch('/all-interns', {  // from server
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    if (allInterns.ok) {
        const interns = await allInterns.json();
        if (interns[0].net_id == null) {
            no_interns.style.display = null;
        } else {
            while (interns.length > 0) {
                var intern = interns.pop();
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
                            <a href="#" class="pl-4 pr-4 edit-intern" data-netid=${intern.net_id}><i class="fas fa-edit link-info"></i></a>
                        </span>
                        <span data-toggle="tooltip" data-placement="top" title="Delete Intern">
                            <a href="#" class="pr-4 delete" data-netid=${intern.net_id}><i class="fas fa-trash-alt link-danger"></i></a>
                        </span>
                    </td>
                `;
                table_body.appendChild(tr);
            }
        }
    } else {
        const errMessage = await allInterns.json();
        no_interns.style.display = null;
        no_interns.innerText = errMessage.error + " Please try again.";
    }
}
window.onload = loadTable;

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
        document.querySelector('.filter-option-inner-inner').innerText = "Intern";
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
    // $('#edit-intern-modal').on('show.bs.modal', function(event) {
    //     console.log(event.relatedTarget);
    // })
    $(document).on('click', '.edit-intern', _ => {
        // alert("Hello!")
        // console.log("hi");
        $('#edit-intern-modal').modal('toggle');
        editForm.reset();
        console.log($('.edit-intern').data('netid'));
    });
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

