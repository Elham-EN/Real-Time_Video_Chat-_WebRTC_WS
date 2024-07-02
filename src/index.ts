import ChatUIHandler from "./ChatUIHandler";

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    localVideo: document.getElementById("localVideo") as HTMLVideoElement,
    remoteVideo: document.getElementById("remoteVideo") as HTMLVideoElement,
    startButton: document.getElementById("startButton") as HTMLButtonElement,
    setUsernameButton: document.getElementById("setUsernameButton") as HTMLButtonElement,
    endButton: document.getElementById("endButton") as HTMLButtonElement,
    muteButton: document.getElementById("muteButton") as HTMLButtonElement,
    unmuteButton: document.getElementById("unmuteButton") as HTMLButtonElement,
    sendButton: document.getElementById("sendButton") as HTMLButtonElement,
    fileInput: document.getElementById("fileInput") as HTMLInputElement,
    sendFileButton: document.getElementById("sendFileButton") as HTMLButtonElement,
    chatInput: document.getElementById("chatInput") as HTMLInputElement,
    chatBox: document.getElementById("chatBox") as HTMLDivElement,
    usernameInput: document.getElementById("username") as HTMLInputElement,
    localUsernameLabel: document.getElementById("localUsernameLabel") as HTMLLabelElement,
    remoteUsernameLabel: document.getElementById(
      "remoteUsernameLabel"
    ) as HTMLLabelElement,
  };

  new ChatUIHandler(elements);
});
