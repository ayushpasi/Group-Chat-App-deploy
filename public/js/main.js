async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}
logoutBtn.addEventListener("click", logout);
