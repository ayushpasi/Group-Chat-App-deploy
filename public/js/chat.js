const userMessage = document.getElementById("userMessage");
const messageSendBtn = document.getElementById("messageSendBtn");
const chatBoxBody = document.getElementById("chatBoxBody");

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
    const res = await axios.get("http://localhost:3000/chat/getMessages");
    const token = localStorage.getItem("token");
    const decodedToken = decodeToken(token);
    const userId = decodedToken.userId;
    chatBoxBody.innerHTML = "";
    console.log(res.data.messages);
    res.data.messages.forEach((message) => {
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
    });
  } catch (error) {
    console.log(error);
  }
}
setInterval(() => {
  getMessages();
}, 1000);
messageSendBtn.addEventListener("click", messageSend);
document.addEventListener("DOMContentLoaded", getMessages);
