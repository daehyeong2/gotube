const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".video__comment-delete");

const addComment = (text, commentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const { name, url, id } = form.dataset;
  const li = document.createElement("li");
  li.classList = "video__comment";
  li.dataset.id = commentId;
  const leftDiv = document.createElement("div");
  const rightDiv = document.createElement("div");
  leftDiv.classList = "video__comment-left";
  rightDiv.classList = "video__comment-right";
  const avatarA = document.createElement("a");
  avatarA.href = `/users/${id}`;
  const avatar = document.createElement("img");
  avatar.classList = "video__comment-avatar";
  avatar.crossorigin = "anonymous";
  if (!url) {
    avatar.src = "/uploads/avatars/defaultImage";
  } else {
    avatar.src = url.startsWith("https://") ? url : `/${url}`;
  }
  const nameA = document.createElement("a");
  nameA.href = `/users/${id}`;
  nameA.classList = "video__comment-name";
  nameA.innerText = name;
  const textP = document.createElement("p");
  textP.innerText = text;
  textP.classList = "video__comment-text";
  const deleteI = document.createElement("i");
  deleteI.classList = "video__comment-delete fas fa-trash";
  deleteI.addEventListener("click", handleDelete);
  avatarA.appendChild(avatar);
  leftDiv.appendChild(avatarA);
  rightDiv.appendChild(nameA);
  rightDiv.appendChild(textP);
  rightDiv.appendChild(deleteI);
  li.appendChild(leftDiv);
  li.appendChild(rightDiv);
  videoComments.prepend(li);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value;
  const videoId = videoContainer.dataset.id;
  if (text == "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.ok) {
    input.value = "";
    const { commentId } = await response.json();
    addComment(text, commentId);
  }
};

const handleDelete = async (event) => {
  const commentId = event.target.parentNode.parentNode.dataset.id;
  const { ok } = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  if (ok) {
    event.target.parentNode.parentNode.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
  deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
