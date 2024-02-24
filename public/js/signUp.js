async function submitForm(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const mobile = document.getElementById("mobile").value;

  const data = {
    name,
    email,
    mobile,
    password,
  };

  try {
    const response = await axios.post("/user/signup", data);

    if (response.status === 200) {
      let success = document.getElementById("success");
      success.style.color = "green";
      success.innerHTML = response.data.message;
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("mobile").value = "";
      document.getElementById("password").value = "";
    }
  } catch (error) {
    console.log(error.response.status);
    if (error.response.status === 409) {
      let success = document.getElementById("success");
      success.innerHTML = "Email is already taken";
      success.style.color = "red";
      document.getElementById("email").value = "";
    }
    if (error.response.status === 400) {
      let success = document.getElementById("success");
      success.innerHTML = "Some data is missing";
      success.style.color = "red";
      document.getElementById("email").value = "";
    }
  }
}
