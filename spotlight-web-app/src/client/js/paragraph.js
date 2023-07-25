// Loading in All Intern Data into Table
const table_body = document.querySelector('#paragraphs');
const no_paragraphs = document.querySelector('#no-paragraph-alert');

/**
 * @param {bool} isIntern - a bool whether the user is an Intern or not.
 * @param {JSON || Array} user_data - if isIntern, then a JSON object containing user's term & paragraph 
 *                                      else an array of JSON objects containing a user's paragraph info
 * Appends paragraphs to the table_body
 */
function appendToTable(isIntern, user_data) {
    table_body.textContent = ''; // clear the current table since this function is called multiple times when using pagination
    if (isIntern) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${current_user.name}</td>
        <td>${user_data.term}</td>
        <td>${user_data.paragraph}</td>
        `;
        table_body.appendChild(tr);
    } else {
        while (user_data.length > 0) {
            const tr = document.createElement('tr');
            var user = user_data.pop();
            tr.setAttribute('data-name', user.name);
            var edit_user_data = JSON.stringify({name: user.name, paragraph: user.paragraph});
            tr.innerHTML = `
                <td>${user.net_id}</td>
                <td>${user.name}</td>
                <td>${user.term}</td>
                <td>${user.paragraph}</td>
                <td>${user.updatedBy}</td>
                <td>${user.updatedDate.substring(0,10).concat(" ", user.updatedDate.substring(11,19))}</td>
                <td class="text-center">
                    <span data-toggle="tooltip" data-placement="top" title="Edit Paragraph">
                        <a href="#" class="pl-4 pr-4 edit-user" data-user='${edit_user_data}'><i class="fas fa-edit link-info"></i></a>
                    </span>
                </td>
            `;
            table_body.appendChild(tr);
        }
    }
}

/**
 * IF INTERN
 *  Loads the table with only the intern's paragraph and term
 * IF STAFF/ADMIN
 *  Loads the table with all the interns' who have paragraphs
 *  Includes pagination logic showing only 10 paragraphs at once
*/
async function loadTable() {
    no_paragraphs.style.display = 'none'; // hide the alert if visible
    table_body.textContent = ''; //clear the current table
    // user has Staff/Admin role
    if (current_user.roles.includes('Staff') || current_user.roles.includes('Admin')) {
        const allParagraphs = await fetch('/all-paragraphs', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'same-origin'  
        })
        const data = await allParagraphs.json();
        console.log(data);
        const totalPages = Math.ceil(data.length/10); 
        const pagination = $('#page-selection').bootpag({
            total: totalPages, // 10 paragraphs on each page
            page: 1, // always start with page 1
            firstLastUse: true, // used to get FIRST and END buttons working
            first: '⇤',
            last: '⇥',
            maxVisible: 5
        })
        $("#page-selection li").addClass('page-item');
        $("#page-selection a").addClass('page-link');
        if (allParagraphs.ok) {
            if (data.message == null) {
                // if there are <=10 paragraphs
                if (totalPages == 1) {
                    appendToTable(false, data);
                }
                if (totalPages > 1) {
                    const first10 = data.slice(0, 10);
                    appendToTable(false, first10); // on window load, display only the first 10
                    pagination.on('page', function(e, pg_num) {
                        if (pg_num == 1) {
                            appendToTable(false, data.slice(0, 10));
                        } else {
                            // if the arr > 10 * pg_num, then add the multiple of 10 to current page and add the rest to the next page
                            // otherwise add the remaining of arr to the current page.
                            const overflow = (10 * pg_num) - data.length;
                            if (overflow >= 0) {
                                const data_group = data.slice((pg_num - 1) * 10, data.length);
                                appendToTable(false, data_group);
                            } else {
                                const data_group = data.slice((pg_num - 1) * 10, pg_num * 10);
                                appendToTable(false, data_group);
                            }
                        }
                    })
                }
            } else { // no interns found
                no_paragraphs.style.display = null;
                no_paragraphs.innerText = data.message;
            }
        } else { // database error
            no_paragraphs.style.display = null;
            no_paragraphs.innerText = data.message;
        }
    } else { // user is ONLY an Intern
        const userParagraph = await fetch(`/paragraph/${current_user.net_id}`, {  // from server
            method: 'GET',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        })
        const data = await userParagraph.json();
        if (userParagraph.ok) {
            if (data.term) { // if user has paragraphs
                appendToTable(true, {
                    'term': data.term,
                    'paragraph': data.paragraphs[0].paragraph
                })
            } else {
                no_paragraphs.style.display = null; // show the no paragraphs alert
                no_paragraphs.innerText = data.message;
            }
        } else { // some sort of db error
            no_paragraphs.style.display = null;
            no_paragraphs.innerText = data.message;
        }
    }
}
window.onload = loadTable();

$(document).ready(function() {
    // search function
    $('#search').on("keyup", function() {
        var search_term = $(this).val().toLowerCase();
        $('#paragraphs tr').filter(function() {
            var intern_name = $(this).attr('data-name').toLowerCase();
            $(this).toggle(intern_name.includes(search_term));
        })
    })
    /**
     * Manually toggling modal because using data-target/dismiss doesn't work well with our logic of verification.
     */ 
    // close manual toggles 
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