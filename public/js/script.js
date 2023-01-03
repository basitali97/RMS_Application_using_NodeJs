function teacher() {
    window.location.href = './teacher'
}

function student() {
    window.location.href = './student'
}

function result() {
    window.location.href = './result'
    return false;
}

function editStudent() {
    window.location.href = '../editStudent'
    return false;
}

function home() {
    window.location.href = './'
}

function signup() {
    window.location.href = './signup'
}

function studentDelete(id){
    window.location.href = './studentData/' + id;
}

function studentEdit(id){
    window.location.href = './updateStudent/' + id;
}

function addStudent() {
    window.location.href = './addStudent'
}

function logout() {
    window.location.href = './logout'
}

