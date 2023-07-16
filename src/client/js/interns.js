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
                            <a href="#" class="pl-4 pr-4 edit" data-toggle="modal" data-target="#add-intern"><i class="fas fa-edit link-info"></i></a>
                        </span>
                        <span data-toggle="tooltip" data-placement="top" title="Delete Intern">
                            <a href="#" class="pr-4 delete" data-toggle="modal" data-target="#add-intern"><i class="fas fa-trash-alt link-danger"></i></a>
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
const verifyInternForm = document.querySelector('#verify-intern');
const addInternForm = document.querySelector('#new-intern');

$(document).ready(function() {
    $('#add-intern-btn').click(_ => {
        verifyInternForm.reset();
        $('#verify-internID').modal('toggle');
    })
    $('.close-verify').click(_ => {
        if (!invalid_netID.style.display) {
            invalid_netID.style.display = "none"
        }
        $('#verify-internID').modal('toggle');
    })
    $('.close-verify-modal-btn').click(_ => {
        if (!invalid_netID.style.display) {
            invalid_netID.style.display = "none"
        }
        $('#verify-internID').modal('toggle');
    })
    $('.close-add').click(_ => {
        $('#add-intern').modal('toggle');
    })
    $('.close-add-modal-btn').click(_ => {
        $('#add-intern').modal('toggle');
    })
    $('#add-intern').on('show.bs.modal', function() {
        addInternForm.reset();
        if (addInternForm.classList.contains('was-validated')) {
            addInternForm.classList.remove('was-validated');
        }
    });
});

// verifying netID function
const invalid_netID = document.querySelector('#invalid-net-ID');
const verifyNetID = async (net_id) => {
    const verification = await fetch('/verify_net_id',{ // from server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          net_id: net_id,
        }) 
    })
    if (verification.ok) {
        const validity = await verification.json();
        console.log(validity);
        if (validity.message == "valid") {
            return true;
        }
        document.querySelector('#inputNetID').value = '';
        invalid_netID.style.display = null;
        invalid_netID.innerText = validity.message;
        return false;
    } else {
        const invalid = await verification.json();
        document.querySelector('#inputNetID').value = '';
        invalid_netID.style.display = null;
        invalid_netID.innerText = invalid.message;
        console.log(invalid.reason);
        return false;
    }
}

// Handler For Verifying NetID Form 
const handleVerifySubmit = async (e) => {
    e.preventDefault();
    // start loading animation
    document.querySelector('#loading').style.display = "block";
    // Verifying if netID is valid
    const net_id = document.querySelector('#inputNetID').value;
    if (invalid_netID.style.display != null) { // get rid of alert if it's visible
        invalid_netID.style.display = "none";
    }
    const valid = await verifyNetID(net_id);
    // stop loading animation
    document.querySelector('#loading').style.display = "none";
    console.log(valid);
    if (valid) { 
        console.log('Reached!');
        $('#verify-internID').modal('toggle');
        $('#add-intern').modal('toggle');
    };
}

verifyInternForm.addEventListener('submit', handleVerifySubmit, false);
// function getNewInternInputs {
//     const name = document.querySelector('#inputName').value.trim();
//     const major = document.querySelector('#inputMajor').value.trim();
//     const year = document.querySelector('#inputYear').value;
//     const referral = document.querySelector('#inputReferral').value;
//     let reference = referral;
//     if (referral === "other") {
//       reference = document.querySelector('#other-referral-input').value;
//     }
//     const sems = document.querySelector('#inputSems').value;
//     const whyJoin = document.querySelector('#reasonForJoining').value.trim();
//     const funFact = document.querySelector('#funFact').value.trim();
//     const position = document.querySelector('#inputPosition').value.trim();
//     const client = document.querySelector('#inputClient').value.trim();
//     const task1 = document.querySelector('#inputTasks1').value.trim();
//     const task2 = document.querySelector('#inputTasks2').value.trim();
//     const task3 = document.querySelector('#inputTasks3').value.trim();
// }

const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addInternForm.checkValidity()) {
        console.log("Form is Invalid!");
        addInternForm.classList.add('was-validated');
    } else {
        addInternForm.classList.remove('was-validated');

    }
}

addInternForm.addEventListener('submit', handleAddSubmit, false);