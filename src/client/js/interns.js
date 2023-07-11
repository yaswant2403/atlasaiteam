// const table_body = document.querySelector('#intern-data');
const loadTable = async (e) => {
    const allInterns = await fetch('/all-interns',{
        method: 'POST', // from server.js
        headers: {
        'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    if (allInterns.ok) {
        const data = await allInterns.json();
        console.log(data);
    } else {
        const errMessage = await allInterns.json();
        console.log(errMessage);
    }
}
window.onload = loadTable;