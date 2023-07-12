// Loading in All Intern Data into Table
const table_body = document.querySelector('#intern-data');
const no_interns = document.querySelector('#no-interns-alert');

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
                var roles = []
                for (let i = 0; i < intern.roles.length; i++) {
                    roles.push((JSON.parse(JSON.stringify(intern.roles[i]))).role);
                }
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${intern.net_id}</td>
                    <td>${intern.name}</td>
                    <td>${intern.term}</td>
                    <td>${roles.join(', ')}</td>
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

// Verifying if netID is valid
const form = document.querySelector('#new-intern');
const invalid_netID = document.querySelector('#invalid-net-ID');
const handleSubmit = async (e) => {
    e.preventDefault();
    const net_id = document.querySelector('#inputNetID').value; 
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
        const valid = await verification.json();
        if (invalid_netID.style.display != null) {
            invalid_netID.style.display = "none";
        }
        console.log(valid);
    } else {
        const invalid = await verification.json();
        document.querySelector('#inputNetID').value = '';
        invalid_netID.style.display = null;
        invalid_netID.innerText = invalid.message;
        console.log(invalid.reason);
    }
}

form.addEventListener('submit', handleSubmit, false);