const token = localStorage.getItem("token");
const searchbar = document.getElementById("search_bar");
const userMessage = document.getElementById("userMessage");
const messageSendBtn = document.querySelector(
  '.btn.btn-primary[data-btn="messageSendBtn"]'
);
const group_editbtn = group_headContainer.querySelector('input[type="submit"]');

const chatBoxBody = document.getElementById("chatBoxBody");

const socket = io(window.location.origin);

socket.on("common-message", () => {
  if (messageSendBtn.id == 0) {
    ShowCommonChats();
  }
});
socket.on("group-message", (groupId) => {
  if (messageSendBtn.id == groupId) {
    showGroupChats(groupId);
  }
});

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

const showingGroupDetails = async (e) => {
  try {
    const groupId = e.target.id;
    user_list.parentElement.classList.remove("d-none");
    const usersResponse = await axios.get("/user/getUsers", {
      headers: { Authorization: token },
    });
    const memberApi = await axios(`/group/getGroupMembers?groupId=${groupId}`);

    const groupMebers = memberApi.data.users;
    const idSet = new Set(groupMebers.map((item) => item.id));
    user_list.innerHTML = "";
    let text = "";
    const { users } = usersResponse.data;
    users.forEach((user) => {
      if (idSet.has(user.id)) {
        text += `
                <li class="list-group-item  d-flex  justify-content-between">
                    <div class="d-flex  align-items-center justify-content-between">

                        <h6><strong class="mb-1">${user.name}</strong></h6>
                    </div>
                    <input type="checkbox" class="form-check-inline" name="users" value="${user.email}" checked>
                </li>`;
      } else {
        text += `
                <li class="list-group-item  d-flex  justify-content-between">
                    <div class="d-flex  align-items-center justify-content-between">

                        <h6><strong class="mb-1">${user.name}</strong></h6>
                    </div>
                    <input type="checkbox" class="form-check-inline" name="users" value="${user.email}">
                </li>`;
      }
    });
    user_list.innerHTML = text;

    const GroupApiresponse = await axios(`/group/getGroup?groupId=${groupId}`);
    const { group } = GroupApiresponse.data;
    modelElements.groupName.value = group.name;
    model_submibtn.innerHTML = "Update Details";
    model_heading.innerHTML = `Update ${group.name} Details`;
    modelElements.editStatus.value = groupId;
    modal_closeBtn.classList.add("d-none");
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
        await axios.post(`/group/updateGroup?groupId=${groupId}`, data, {
          headers: { Authorization: token },
        });

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
        <div class="d-flex w-100 align-items-center justify-content-between" id="${group.id}">
            
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

const showGroupChat = async (e) => {
  try {
    const groupId = e.target.id;
    console.log(groupId);
    const getUserResponse = await axios.get("/user/getCurrentUser", {
      headers: { Authorization: token },
    });
    const userId = getUserResponse.data.userId;

    if (groupId && groupId != "group_body") {
      setupGroup(groupId, userId);
      if (groupId == 0) {
        ShowCommonChats();
      } else {
        showGroupChats(groupId);
      }
    } else {
      console.log("no group id");
    }
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    // window.location = '/';
  }
};
async function setupGroup(groupId, userId) {
  try {
    if (groupId == 0) {
      group_heading.innerHTML = `Common Group`;
      group_members.innerHTML = ` All Members`;
      group_members.setAttribute(
        "data-bs-original-title",
        `All Members can access this group !`
      );
      messageSendBtn.id = groupId;

      group_editbtn.classList.add("d-none");
    } else {
      const APIresponse = await axios(`/group/getGroup?groupId=${groupId}`);

      const { group } = APIresponse.data;

      group_heading.innerHTML = `${group.name}`;
      group_members.innerHTML = "";

      messageSendBtn.id = groupId;
      if (group.adminId == userId) {
        group_editbtn.id = groupId;

        group_editbtn.classList.remove("d-none");
      } else {
        group_editbtn.classList.add("d-none");
      }
    }
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}

getGroups();
model_submibtn.addEventListener("click", createGroup);
create_groupBtn.addEventListener("click", showingAllUser);
group_editbtn.addEventListener("click", showingGroupDetails);
searchbar.addEventListener("keyup", searchUser);
group_body.addEventListener("click", showGroupChat);

async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
  user;
}

logoutBtn.addEventListener("click", logout);

//chat funtionality
async function messageSend(e) {
  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    groupId = messageSendBtn.id;
    let file = document.getElementById("fileInput").files[0];

    if (file) {
      if (file && file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("GroupId", groupId);
        const imageResponse = await axios.post(
          "http://localhost:3000/chat/postImage",
          formData,
          {
            headers: { Authorization: token },
          }
        );
      } else {
        alert("Please select a valid image file.");
      }
    } else {
      const message = userMessage.value;

      const res = await axios.post(
        "/chat/sendMessage",
        {
          message: message,
          groupId: Number(groupId),
        },
        {
          headers: { Authorization: token },
        }
      );
    }
    document.getElementById("messageForm").reset();
    if (groupId == 0) {
      socket.emit("new-common-message");
      ShowCommonChats();
    } else {
      socket.emit("new-group-message", groupId);
      showGroupChats(groupId);
    }
    // chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
  } catch (error) {
    console.log(error);
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
async function ShowCommonChats() {
  try {
    const localStorageChats = JSON.parse(localStorage.getItem("chats")) || [];
    const lastMessageId = localStorageChats.length
      ? localStorageChats[localStorageChats.length - 1].id
      : 0;

    const res = await axios.get(
      `http://localhost:3000/chat/getMessages/${lastMessageId}`
    );

    const newMessages = res.data.messages;
    const mergedChats = localStorageChats.concat(newMessages);

    localStorage.setItem("chats", JSON.stringify(mergedChats.slice(-1000)));

    const token = localStorage.getItem("token");
    const userId = decodeToken(token).userId;
    displayChatsOnScreen(mergedChats, userId);
  } catch (error) {
    console.error(error);
    // Handle error here, e.g., show an alert and redirect to home
    alert(error.response.data.message);
    window.location = "/";
  }
}

async function showGroupChats(groupId) {
  try {
    const res = await axios.get(`/chat/getGroupMessages?groupId=${groupId}`);
    chatBoxBody.innerHTML = "";
    const token = localStorage.getItem("token");
    const userId = decodeToken(token).userId;
    displayChatsOnScreen(res.data.messages, userId);
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}
// display messages on screen
function displayChatsOnScreen(chats, userId) {
  chatBoxBody.innerHTML = "";

  chats.forEach((chat) => {
    displayChat(chat, userId);
  });

  chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
}

function displayChat(chat, userId) {
  const div = document.createElement("div");
  div.classList.add(
    chat.userId === userId ? "user-message" : "incoming-message"
  );
  chatBoxBody.appendChild(div);

  const messageSendby = document.createElement("span");
  messageSendby.classList.add(
    "d-flex",
    chat.userId === userId ? "justify-content-end" : "justify-content-start",
    "px-3",
    "mb-1",
    "text-uppercase",
    "small",
    "text-black"
  );
  messageSendby.appendChild(
    document.createTextNode(chat.userId === userId ? "You" : chat.name)
  );
  div.appendChild(messageSendby);

  const messageBox = document.createElement("div");
  const messageContent = document.createElement("div");

  messageBox.classList.add(
    "d-flex",
    "flex-column",
    chat.userId === userId ? "align-items-end" : "align-items-start",
    "mb-2"
  );

  messageContent.classList.add(
    chat.userId === userId ? "msg_cotainer_send" : "msg_cotainer"
  );

  if (chat.isImage) {
    const image = document.createElement("img");
    image.src = chat.message;
    image.classList.add("image-message");
    messageContent.appendChild(image);
  } else {
    const textNode = document.createTextNode(chat.message);
    messageContent.appendChild(textNode);
  }

  messageBox.appendChild(messageContent);
  div.appendChild(messageBox);

  // Format and display timestamp
  const timestamp = document.createElement("small");
  timestamp.classList.add("timestamp", "text-muted", "ml-3", "mr-3");
  timestamp.textContent = formatTimestamp(chat.createdAt);
  messageBox.appendChild(timestamp);

  if (chat.userId !== userId) {
    setTimeout(() => {
      chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
    }, 0);
  }
}

// Function to format the timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = {
    hour: "numeric",
    minute: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// You can call this function periodically using setInterval
// setInterval(() => {
//   ShowCommonChats();
// }, 1000);

messageSendBtn.addEventListener("click", messageSend);
document.addEventListener("DOMContentLoaded", ShowCommonChats);
