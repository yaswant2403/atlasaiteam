// Loading in All Intern Data into Table
const table_body = document.querySelector('#paragraphs');
const no_paragraphs = document.querySelector('#no-paragraph-alert');
// console.log(user);

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
    }
    // while (paragraphs.length > 0) {
    //     var admin = paragraphs.pop();
    //     var user_data = JSON.stringify(admin);

    //     tr.innerHTML = `
    //         <td>${admin.net_id}</td>
    //         <td>${admin.name}</td>
    //         <td>${admin.term}</td>
    //         <td>${admin.roles.join(', ')}</td>
    //         <td>${admin.updatedBy}</td>
    //         <td>${admin.updatedDate.substring(0,10).concat(" ", admin.updatedDate.substring(11,19))}</td>
    //         <td class="text-center">
    //             <span data-toggle="tooltip" data-placement="top" title="Edit Admin">
    //                 <a href="#" class="pl-4 pr-4 edit-admin" data-user='${user_data}'><i class="fas fa-edit link-info"></i></a>
    //             </span>
    //         </td>
    //     `;
    //     table_body.appendChild(tr);
    // }
}

/**
 * Loads the table by grabbing all the admin from the database
 * Also includes pagination logic showing only 15 admin at once
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
        // console.log(current_user);
    } else { // user is an Intern
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

    // const allAdmin = await fetch('/all-admin', {  // from server
    //     method: 'POST',
    //     headers: {
    //     'Content-Type': 'application/json'
    //     },
    //     credentials: 'same-origin'
    // })
    // const admin = await allAdmin.json();
    // const totalPages = Math.ceil(admin.length/15); 
    // const pagination = $('#page-selection').bootpag({
    //     total: totalPages, // 15 admin on each page
    //     page: 1, // always start with page 1
    //     firstLastUse: true, // used to get FIRST and END buttons working
    //     first: '⇤',
    //     last: '⇥',
    //     maxVisible: 5
    // })
    // $("#page-selection li").addClass('page-item');
    // $("#page-selection a").addClass('page-link');
    // if (allAdmin.ok) {
    //     if (admin[0].net_id == null) { // no admin found
    //         no_paragraphs.style.display = null;
    //     } else {
    //         // if there are <=15 admin
    //         if (totalPages == 1) {
    //             appendToTable(admin);
    //         }
    //         // if there are > 15 admin, split them up into groups of 15 or less.
    //         if (totalPages > 1) {
    //             const first15 = admin.slice(0, 15);
    //             appendToTable(first15); // on window load, display only the first 15
    //             pagination.on('page', function(e, pg_num) {
    //                 if (pg_num == 1) {
    //                     appendToTable(admin.slice(0, 15));
    //                 } else {
    //                     // if the arr > 15 * pg_num, then add the multiple of 15 to current page and add the rest to the next page
    //                     // otherwise add the remaining of arr to the current page.
    //                     const overflow = (15 * pg_num) - admin.length;
    //                     if (overflow >= 0) {
    //                         const admin_group = admin.slice((pg_num - 1) * 15, admin.length);
    //                         appendToTable(admin_group);
    //                     } else {
    //                         const admin_group = admin.slice((pg_num - 1) * 15, pg_num * 15);
    //                         appendToTable(admin_group);
    //                     }
    //                 }
    //             })
    //         }
    //     }
    // } else {
    //     const errMessage = await allAdmin.json();
    //     no_paragraphs.style.display = null;
    //     no_paragraphs.innerText = errMessage.error + " Please refresh the page again.";
    // }
}

window.onload = loadTable();