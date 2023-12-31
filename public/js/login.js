async function loginForm(e) {
  e.preventDefault(); // Prevent the default form submission behavior
  const email = e.target.loginEmail.value;
  const password = e.target.loginPassword.value;

  const data = {
    email,
    password,
  };

  try {
    const response = await axios.post("/user/login", data);

    if (response.status === 200) {
      alert("Login sucssesfull");
      localStorage.setItem("token", response.data.token);

      window.location.href = "/";
    }
  } catch (error) {
    console.log(error.response.status);

    if (error.response.status === 404) {
      let login_success = document.getElementById("login_success");
      login_success.style.color = "red";
      login_success.innerHTML = "User not found";
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";
    }

    if (error.response.status === 401) {
      let login_success = document.getElementById("login_success");
      login_success.style.color = "red";
      login_success.innerHTML = "User not authorized";
    }
  }
}
