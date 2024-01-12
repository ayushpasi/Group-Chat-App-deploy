const token = localStorage.getItem("token");
const searchbar = document.getElementById("search_bar");
const userMessage = document.getElementById("userMessage");
const messageSendBtn = document.getElementById("messageSendBtn");
const chatBoxBody = document.getElementById("chatBoxBody");

const showingAllUser = async () => {
  try {
    user_list.parentElement.classList.remove("d-none");
    const usersResponse = await axios.get("/user/getUsers", {
      headers: { Authorization: token },
    });

    user_list.innerHTML = "";
    let text = "";
    const { users } = usersResponse.data;
    users.forEach((user) => {
      text += `
    <li class="list-group-item d-flex justify-content-between">
      <div class="d-flex align-items-center">
        <i class="fas fa-user user-icon mr-2"></i> <!-- Added mr-2 for right margin -->
        <h6 style="margin-left: 10px;"><strong>${user.name}</strong></h6>
      </div>
      <input type="checkbox" class="form-check-inline" name="users" value="${user.email}">
    </li>`;
    });
    user_list.innerHTML = text;
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
};

const searchUser = (e) => {
  const text = e.target.value.toLowerCase();
  console.log(text);
  const items = user_list.querySelectorAll("li");
  const usersArr = Array.from(items);
  usersArr.forEach(blockdisplay);
  function blockdisplay(value) {
    const userName = value.querySelector("h6").textContent;
    if (userName.toLowerCase().indexOf(text) != -1) {
      value.classList.add("d-flex");
      value.style.display = "block";
    } else {
      value.classList.remove("d-flex");
      value.style.display = "none";
    }
  }
};

const modelElements = {
  groupName: group_model.querySelector('input[name="group_name"]'),
  searchBar: group_model.querySelector('input[name="search_bar"]'),
  groupDesription: group_model.querySelector(
    'textarea[name="group_description"]'
  ),
  editStatus: group_model.querySelector('input[name="edit_status"]'),
};

async function createGroup(e) {
  try {
    if (create_group_form.checkValidity()) {
      e.preventDefault();
      const groupName = create_group_form.querySelector("#group_name").value;
      const selectedUsers = Array.from(
        user_list.querySelectorAll('input[name="users"]:checked')
      ).map((checkbox) => checkbox.value);
      const data = {
        groupName: groupName,

        members: selectedUsers,
      };
      if (modelElements.editStatus.value == "false") {
        await axios.post("/group/createGroup", data, {
          headers: { Authorization: token },
        });
        alert("Group successfully created");
      } else {
        const groupId = modelElements.editStatus.value;
        await axios.post(`user/update-group?groupId=${groupId}`, data);

        model_submibtn.innerHTML = "Create Group";
        model_heading.innerHTML = `Create new group`;
        modelElements.editStatus.value = "false";
        modal_closeBtn.classList.remove("d-none");
        alert("Group successfully updated");
      }
      create_group_form.reset();
      $("#group_model").modal("hide");
      getGroups();
    } else {
      alert("fill all details ");
    }
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}

const getGroups = async () => {
  try {
    const groupsResponse = await axios(`/group/getGroups`, {
      headers: { Authorization: token },
    });
    const { groups } = groupsResponse.data;
    group_body.innerHTML = `
    <button class="list-group-item list-group-item-action py-2" 
        data-bs-toggle="list">
        <div class="d-flex w-100 align-items-center justify-content-between" id="0">
           
            <strong class="mb-1">Common-group</strong>
            <small>All Members</small>
        </div>
    </button>
    `;
    let html = "";
    groups.forEach((group) => {
      html += `               
    <button class="list-group-item list-group-item-action py-2" 
        data-bs-toggle="list">
        <div class="d-flex w-100 align-items-center justify-content-between" >
            
            <strong class="mb-1">${group.name}</strong>
            <small>${group.admin} is Admin</small>
        </div>
    </button>`;
    });
    group_body.innerHTML += html;
  } catch (error) {
    console.log(error);
  }
};
getGroups();
model_submibtn.addEventListener("click", createGroup);
create_groupBtn.addEventListener("click", showingAllUser);
searchbar.addEventListener("keyup", searchUser);

async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

logoutBtn.addEventListener("click", logout);

//chat funtionality
async function messageSend() {
  try {
    const message = userMessage.value;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:3000/chat/sendMessage",
      {
        message: message,
      },
      {
        headers: { Authorization: token },
      }
    );
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
  } catch (error) {
    console.log("something went wrong");
  }
}
function decodeToken(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
async function getMessages() {
  try {
    let param;
    const localStorageChats = JSON.parse(localStorage.getItem("chats"));
    if (localStorageChats) {
      let array = JSON.parse(localStorage.getItem("chats"));
      let length = JSON.parse(localStorage.getItem("chats")).length;
      param = array[length - 1].id;
    }
    const res = await axios.get(
      `http://localhost:3000/chat/getMessages/${param}`
    );

    const chats = JSON.parse(localStorage.getItem("chats"));
    if (!chats) {
      localStorage.setItem("chats", JSON.stringify(res.data.messages));
    } else {
      res.data.messages.forEach((message) => {
        chats.push(message);
      });
      localStorage.setItem("chats", JSON.stringify(chats));
    }
    if (res) {
      res.data.messages.forEach((message) => {
        displayMessages(message);
        chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
      });
    }
  } catch (error) {
    console.error(error);
  }
}

setInterval(() => {
  getMessages();
}, 1000);

async function getMessagesFromLocalStorage() {
  const messages = JSON.parse(localStorage.getItem("chats"));

  const token = localStorage.getItem("token");
  const decodedToken = decodeToken(token);
  const userId = decodedToken.userId;
  chatBoxBody.innerHTML = "";

  if (messages) {
    messages.forEach((message) => {
      displayMessages(message);
    });
  }
}

// display messages on screen
const displayMessages = (message) => {
  const token = localStorage.getItem("token");
  const decodedToken = decodeToken(token);
  const userId = decodedToken.userId;
  if (message.userId == userId) {
    const div = document.createElement("div");
    div.classList.add("user-message", "justify-content-end");
    chatBoxBody.appendChild(div);

    const messageSendby = document.createElement("span");
    messageSendby.classList.add(
      "d-flex",
      "justify-content-end",
      "px-3",
      "mb-1",
      "text-uppercase",
      "small",
      "text-black"
    );
    messageSendby.appendChild(document.createTextNode("You"));
    div.appendChild(messageSendby);

    const messageBox = document.createElement("div");
    const messageText = document.createElement("div");

    messageBox.classList.add("d-flex", "justify-content-end", "mb-4");

    messageText.classList.add("msg_cotainer_send");
    messageText.appendChild(document.createTextNode(message.message));

    messageBox.appendChild(messageText);
    div.appendChild(messageBox);
  } else {
    const div = document.createElement("div");
    div.classList.add("incoming-message");
    chatBoxBody.appendChild(div);

    const messageSendby = document.createElement("span");
    messageSendby.classList.add(
      "d-flex",
      "justify-content-start",
      "px-3",
      "mb-1",
      "text-uppercase",
      "small",
      "text-black"
    );
    messageSendby.appendChild(document.createTextNode(message.name));
    div.appendChild(messageSendby);

    const messageBox = document.createElement("div");
    const messageText = document.createElement("div");

    messageBox.classList.add("d-flex", "justify-content-start", "mb-4");

    messageText.classList.add("msg_cotainer");
    messageText.appendChild(document.createTextNode(message.message));

    messageBox.appendChild(messageText);
    div.appendChild(messageBox);
    setTimeout(() => {
      chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
    }, 0);
  }
};
messageSendBtn.addEventListener("click", messageSend);
document.addEventListener("DOMContentLoaded", getMessagesFromLocalStorage);
