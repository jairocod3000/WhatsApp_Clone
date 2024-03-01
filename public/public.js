// Inicialización del socket
var socket = io();

// Elementos del formulario y del chat
var userForm = $(".userForm");
var form = document.getElementById('form');
var usernameForm = document.getElementById("usernameForm");
var usernameInput = document.getElementById("usernameInput");
var userTyping = document.getElementsByClassName("users-title")[0];

// Manejo del formulario de usuario
$(document).on("submit", ".userForm", function(e) {
    e.preventDefault();
    // Obtener datos del formulario
    var username = $("#inputUsername").val();
    var room = $("#selectRoom").val();
    var img = $("input[name='avatar']:checked").val();

    // Emitir evento para establecer el nombre de usuario
    socket.emit('setUsername', {username: username, room: room, userImg: img});

    // Limpiar campo de entrada de usuario
    $("#usernameInput").val();

    // Actualizar el contenido de la página con la interfaz del chat
    $(".container").html(`
        <nav class="nav">
            <i class="fa-brands fa-whatsapp"></i>
            <h1>Whatsapp-clone</h1>
        </nav>
        <div class="whatsapp-container">
            <div id="roomName">
                SALA ${room} - Usuarios conectados: <span id="usersConnected"></span>
            </div>
            <div class="users">
                <h2 class="leftRoom">Abandonar Sala <i class="fa-solid fa-right-from-bracket"></i></h2>
                <div class="usersConnected"></div>
            </div>
            <div class="messagesCont">
                <div class="messages"></div>
                <form action="" id="form">
                    <input type="text" id="input" placeholder="Mensaje..." autocomplete="off">
                    <button id="submit"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
        <div class="mobileUsersConnected"></div>
        <span class="usersBtn"><i class="fa-solid fa-xmark"></i></span>
    `);
});

// Manejo del envío de mensajes
$(document).on('submit', '#form', function(e) {
    e.preventDefault();
    // Verificar si hay texto en el campo de entrada
    if (input.value) {
        // Obtener la hora actual
        var today = new Date();
        var time = today.getHours() + ":" + (today.getMinutes() < 10 ? "0" : "") + today.getMinutes();
        
        // Emitir evento de mensaje
        socket.emit('message', {msg: input.value, time: time});
        // Limpiar el campo de entrada
        input.value = '';
    }
});

// Mostrar la lista de usuarios conectados
socket.on('usersConnected', (users)=>{
    $(".usersConnected").html("");
    for(user of users){
        $(".usersConnected").append(`
        <div class="user">
            <img src="${user.userImg}">
            <div class="user-info">
                <span class="user-info-name">${user.username}</span>    
                <span class="isTyping">escribiendo...</span>
                <input type="hidden" id="${user.userID}"/>
            </div>
        </div>
        `);
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// Actualizar el número de usuarios conectados
socket.on("numUsersConnected", (num)=>{
    $("#usersConnected").html(num);
});

// Manejar la conexión de un usuario
socket.on("userHasConnected", (username)=>{
    $(".messages").append(`
        <div class="userConnection">
            ${username} se ha conectado
        </div>
    `);
    window.scrollTo(0, document.body.scrollHeight);
});

// Manejar la desconexión de un usuario
socket.on("userHasDisconnected", (username)=>{
    $(".messages").append(`
        <div class="userConnection">
            ${username} se ha desconectado <i class="fa-solid fa-right-from-bracket"></i>
        </div>
    `);
    window.scrollTo(0, document.body.scrollHeight);
});

// Manejar la recepción de mensajes
socket.on('message', function(datosMsg) {
    if(socket.id == datosMsg.serverID){
        newMsg("ownUserMessage", datosMsg.username, datosMsg.msg, datosMsg.time);
    }else{
        newMsg("otherUserMessage", datosMsg.username, datosMsg.msg, datosMsg.time);
    }
    $(".messages").animate(
        { scrollTop: $(".messages").prop("scrollHeight") },
        500
    );
});

// Manejar la señal de usuario escribiendo
$(document).on('keyup', '#input', function(e) {
    if($("#input").val() != ""){
        socket.emit('userTyping',  {isTyping: true});
    }else{
        socket.emit('userTyping',  {isTyping: false});
    }
});

// Actualizar la interfaz cuando un usuario está escribiendo
socket.on("userTyping", (data)=>{
    if(!data.isTyping) {
        $(`#${data.userID}`).siblings('.isTyping').css("display", "none"); 
    }else{
        $(`#${data.userID}`).siblings('.isTyping').css("display", "block"); 
    }
});

// Función para agregar un nuevo mensaje al chat
function newMsg(typeClass, username, msg, timeMsg){
    var newMsg = "";
    if(typeClass == "ownUserMessage"){
        newMsg = $(`
        <div class="${typeClass}">
            <span class="msg">${msg}</span>
            <span class="timeMsg">${timeMsg}</span>
        </div>
        `);
    }else{
        newMsg = $(`
        <div class="${typeClass}">
            <span class="usernameMsg">${username}</span>
            <span class="msg">${msg}</span>
            <span class="timeMsg">${timeMsg}</span>
        </div>
    `);
    }
    $(".messages").append(newMsg);
}

// Recargar la página al abandonar la sala
$(document).on("click", ".leftRoom", ()=>{
    window.location.reload();
});

// Modificar el estilo para dispositivos móviles
$(document).on("click", "#joinBtn", ()=>{
    setTimeout(() => {
        $(".nav").css("display", "none");
    }, 10);
});

// Mostrar/ocultar menú de usuarios conectados en móviles
$(document).on("click", "#roomName, .usersBtn", ()=>{
    $(".mobileUsersConnected").toggleClass("openMenu");
    $(".usersBtn").toggleClass("block");
});
