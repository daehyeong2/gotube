const message = document.querySelector(".message");

const handleDelete = () => {
  message.classList.add("hide");
  setTimeout(() => {
    message.remove();
  }, 300);
};

if (message) {
  message.addEventListener("click", handleDelete);
}
