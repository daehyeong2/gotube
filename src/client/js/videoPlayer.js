const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

const VOLUME = "volume";
let localVolume = localStorage.getItem(VOLUME);
if (localVolume == 0) {
  video.muted = true;
  muteIcon.classList = "fas fa-volume-xmark";
}
if (!localVolume) {
  localStorage.setItem(VOLUME, 0.5);
  localVolume = 0.5;
}

volumeRange.value = localVolume;
let volumeValue = localVolume;
video.volume = volumeValue;
let controlsTimeout = null;
let controlsMovementTimeout = null;

const handlePlay = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteIcon.classList = video.muted
    ? "fas fa-volume-xmark"
    : "fas fa-volume-high";
  if (!video.muted && volumeValue == 0) {
    localStorage.setItem("volume", 0.5);
    volumeRange.value = 0.5;
    video.volume = 0.5;
  } else {
    const newVolume = !video.muted ? volumeValue : 0;
    localStorage.setItem("volume", newVolume);
    volumeRange.value = newVolume;
    video.volume = newVolume;
  }
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteIcon.classList = "fas fa-volume-high";
  }
  if (value == 0) {
    video.muted = true;
    muteIcon.classList = "fas fa-volume-xmark";
  }
  localStorage.setItem("volume", value);
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(14, 19);
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = video.duration.toFixed(1);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = video.currentTime.toFixed(1);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  playIcon.classList.remove("fa-pause");
  playIcon.classList.add("fa-play");
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => {
  videoControls.classList.remove("showing");
  controlsTimeout = null;
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  controlsTimeout = setTimeout(hideControls, 300);
};

const handleSpaceBar = (event) => {
  if (event.key == " ") {
    handlePlay();
  }
};

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
window.onload = () => {
  handleLoadedMetadata();
};
video.addEventListener("click", handlePlay);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
window.addEventListener("keydown", handleSpaceBar);
