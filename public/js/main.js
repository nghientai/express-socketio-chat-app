const chatForm = document.getElementById("chatForm");
const msgBody = document.getElementById("msgBody");
const userList = document.getElementById("userList");

// Get username and room form URL
const { fullName, chatRoom } = Qs.parse(location.search, {
   ignoreQueryPrefix: true,
});

var socket = io();

// Join chat room
socket.emit("joinRoom", { fullName, chatRoom });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
   outputRoomName(room);
   outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
   console.log(message);
   outputMsg(message);
   // Scroll down
   msgBody.scrollTop = msgBody.scrollHeight;
});

function outputMsg(msg) {
   const div = document.createElement("div");
   div.classList.add("media", "mb-3");
   div.innerHTML = `
    <img
        src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
        alt="user"
        width="50"
        class="rounded-circle mt-2"
        />
   <div class="media-body ml-3">
        <span class="small text-muted">${msg.username} ${msg.time}</span>
      <div class="bg-light rounded py-2 px-2 mb-2">
         <p class="text-small mb-0 text-muted">${msg.text}</p>
      </div>
   </div>
    `;
   msgBody.appendChild(div);
}

// Submit the form
chatForm.addEventListener("submit", (e) => {
   e.preventDefault();
   const msg = e.target.elements.message.value;
   if (msg !== "") {
      socket.emit("message", msg);
   }
   e.target.elements.message.value = "";
   e.target.elements.message.focus();
});

// Display room name
function outputRoomName(roomName) {
   document.getElementById("roomName").innerHTML = `# ${roomName}`;
}

// Display list of users
function outputUsers(users) {
   var div = "";
   users.map((user) => {
      div += `<div class="list-group-item list-group-item-action rounded-0 border-0">
    <div class="media align-items-center">
        <img
            src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
            alt="user"
            width="50"
            class="rounded-circle"
        />
        <div class="media-body ml-4">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <h6 class="mb-0">${user.username}</h6>
            </div>
        </div>
    </div>
    </div>`;
   });
   userList.innerHTML = div;
}
