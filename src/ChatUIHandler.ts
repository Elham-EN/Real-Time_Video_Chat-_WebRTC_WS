import WebSocketHandler from "./WebSocketHandler";
import PeerConnectionHandler from "./PeerConnectionHandler";

interface ChatUIElements {
  localVideo: HTMLVideoElement;
  remoteVideo: HTMLVideoElement;
  startButton: HTMLButtonElement;
  setUsernameButton: HTMLButtonElement;
  endButton: HTMLButtonElement;
  muteButton: HTMLButtonElement;
  unmuteButton: HTMLButtonElement;
  sendButton: HTMLButtonElement;
  fileInput: HTMLInputElement;
  sendFileButton: HTMLButtonElement;
  chatInput: HTMLInputElement;
  chatBox: HTMLDivElement;
  usernameInput: HTMLInputElement;
  localUsernameLabel: HTMLLabelElement;
  remoteUsernameLabel: HTMLLabelElement;
}

export default class ChatUIHandler {
  private localVideo: HTMLVideoElement;
  private remoteVideo: HTMLVideoElement;
  private startButton: HTMLButtonElement;
  private setUsernameButton: HTMLButtonElement;
  private endButton: HTMLButtonElement;
  private muteButton: HTMLButtonElement;
  private unmuteButton: HTMLButtonElement;
  private sendButton: HTMLButtonElement;
  private fileInput: HTMLInputElement;
  private sendFileButton: HTMLButtonElement;
  private chatInput: HTMLInputElement;
  private chatBox: HTMLDivElement;
  private usernameInput: HTMLInputElement;
  private localUsernameLabel: HTMLLabelElement;
  private remoteUsernameLabel: HTMLLabelElement;

  private localStream: MediaStream | null = null;
  private peerConnectionHandler: PeerConnectionHandler;
  private webSocketHandler: WebSocketHandler;
  private username: string = "You";

  /**
   * Initializes a new ChatUIHandler.
   *
   * @param {ChatUIElements} elements - The DOM elements.
   */
  constructor(elements: ChatUIElements) {
    this.localVideo = elements.localVideo;
    this.remoteVideo = elements.remoteVideo;
    this.startButton = elements.startButton;
    this.setUsernameButton = elements.setUsernameButton;
    this.endButton = elements.endButton;
    this.muteButton = elements.muteButton;
    this.unmuteButton = elements.unmuteButton;
    this.sendButton = elements.sendButton;
    this.fileInput = elements.fileInput;
    this.sendFileButton = elements.sendFileButton;
    this.chatInput = elements.chatInput;
    this.chatBox = elements.chatBox;
    this.usernameInput = elements.usernameInput;
    this.localUsernameLabel = elements.localUsernameLabel;
    this.remoteUsernameLabel = elements.remoteUsernameLabel;

    this.peerConnectionHandler = new PeerConnectionHandler(this.remoteVideo);
    this.webSocketHandler = new WebSocketHandler("ws://localhost:3000");

    this.init();
  }

  /**
   * Initializes UI event listeners and WebSocket handlers.
   */
  private init(): void {
    this.webSocketHandler.on("open", this.handleWebSocketOpen.bind(this));
    this.webSocketHandler.on("error", this.handleWebSocketError.bind(this));
    this.webSocketHandler.on("close", this.handleWebSocketClose.bind(this));
    this.webSocketHandler.on("message", this.handleWebSocketMessage.bind(this));

    this.setUsernameButton.addEventListener("click", this.setUsername.bind(this));
    this.startButton.addEventListener("click", this.startVideoChat.bind(this));
    this.endButton.addEventListener("click", this.endVideoChat.bind(this));
    this.muteButton.addEventListener("click", () => this.toggleMic(false));
    this.unmuteButton.addEventListener("click", () => this.toggleMic(true));
    this.sendButton.addEventListener("click", this.sendMessage.bind(this));
    this.sendFileButton.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", this.handleFileInput.bind(this));

    this.chatInput.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.sendMessage();
      }
    });

    this.peerConnectionHandler.onIceCandidate = (candidate: RTCIceCandidate) => {
      this.webSocketHandler.send({
        type: "candidate",
        candidate,
        username: this.username,
      });
    };
  }

  /**
   * Handles WebSocket connection open event.
   */
  private handleWebSocketOpen(): void {
    console.log("WebSocket connection established");
  }

  /**
   * Handles WebSocket error event.
   *
   * @param {Event} error - The error event.
   */
  private handleWebSocketError(error: Event): void {
    console.error("WebSocket error:", error);
  }

  /**
   * Handles WebSocket close event.
   */
  private handleWebSocketClose(): void {
    console.log("WebSocket connection closed");
  }

  /**
   * Handles incoming WebSocket messages.
   *
   * @param {MessageEvent} event - The message event.
   */
  private async handleWebSocketMessage(event: MessageEvent): Promise<void> {
    const message = JSON.parse(event.data);
    console.log("Received WebSocket message:", message);

    switch (message.type) {
      case "offer":
        await this.handleOffer(message);
        break;
      case "answer":
        await this.handleAnswer(message);
        break;
      case "candidate":
        await this.handleCandidate(message);
        break;
      case "chat":
        this.displayChatMessage(message);
        break;
      case "file":
        this.displayFileMessage(message);
        break;
      case "end":
        this.handleEndChat();
        break;
    }
  }

  /**
   * Sets the username for the local user.
   */
  private setUsername(): void {
    this.username = this.usernameInput.value || "Anonymous";
    this.localUsernameLabel.textContent = this.username;
    console.log("Username set to:", this.username);
  }

  /**
   * Starts the video chat by obtaining user media and creating an offer.
   */
  private async startVideoChat(): Promise<void> {
    console.log("Start button clicked");
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("User media obtained");
      this.localVideo.srcObject = this.localStream;

      this.peerConnectionHandler.addStream(this.localStream);

      const offer = await this.peerConnectionHandler.createOffer();
      this.webSocketHandler.send({ type: "offer", offer, username: this.username });
      this.updateUIForChatStart();
    } catch (e) {
      console.error("Error accessing media devices.", e);
    }
  }

  /**
   * Ends the video chat by sending an end message and resetting the UI.
   */
  private endVideoChat(): void {
    console.log("End button clicked");
    this.webSocketHandler.send({ type: "end" });
    this.handleEndChat();
  }

  /**
   * Handles file input change event to send the selected file.
   *
   * @param {Event} event - The change event.
   */
  private handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const fileData = e.target?.result;
        const fileMessage = {
          type: "file",
          file: fileData,
          filename: file.name,
          username: this.username,
        };
        this.webSocketHandler.send(fileMessage);
        this.displayFileMessage(fileMessage, true);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Sends a chat message to the server.
   */
  private sendMessage(): void {
    const message = this.chatInput.value.trim();
    if (message) {
      const chatMessage = { type: "chat", message, username: this.username };
      this.webSocketHandler.send(chatMessage);
      this.displayChatMessage(chatMessage, true);
      this.chatInput.value = "";
    }
  }

  /**
   * Handles WebRTC offer messages.
   *
   * @param {any} message - The offer message.
   */
  private async handleOffer(message: any): Promise<void> {
    await this.peerConnectionHandler.setRemoteDescription(message.offer);
    const answer = await this.peerConnectionHandler.createAnswer();
    this.webSocketHandler.send({ type: "answer", answer, username: this.username });
    this.remoteUsernameLabel.textContent = message.username;
  }

  /**
   * Handles WebRTC answer messages.
   *
   * @param {any} message - The answer message.
   */
  private async handleAnswer(message: any): Promise<void> {
    await this.peerConnectionHandler.setRemoteDescription(message.answer);
    this.remoteUsernameLabel.textContent = message.username;
  }

  /**
   * Handles WebRTC ICE candidate messages.
   *
   * @param {any} message - The ICE candidate message.
   */
  private async handleCandidate(message: any): Promise<void> {
    await this.peerConnectionHandler.addIceCandidate(message.candidate);
  }

  /**
   * Displays a chat message in the chat box.
   *
   * @param {any} data - The chat message data.
   * @param {boolean} [isSent=false] - Whether the message was sent by the local user.
   */
  private displayChatMessage(data: any, isSent = false): void {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isSent ? "sent" : "received");

    const contentElement = document.createElement("div");
    contentElement.classList.add("content");
    contentElement.textContent = isSent
      ? data.message
      : `${data.username}: ${data.message}`;

    messageElement.appendChild(contentElement);
    this.chatBox.appendChild(messageElement);
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  /**
   * Displays a file message in the chat box.
   *
   * @param {any} data - The file message data.
   * @param {boolean} [isSent=false] - Whether the message was sent by the local user.
   */
  private displayFileMessage(data: any, isSent = false): void {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isSent ? "sent" : "received");

    const contentElement = document.createElement("div");
    contentElement.classList.add("content");

    const img = document.createElement("img");
    img.src = data.file;
    img.alt = data.filename;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "5px";

    contentElement.appendChild(img);
    messageElement.appendChild(contentElement);
    this.chatBox.appendChild(messageElement);
    this.chatBox.scrollTop = this.chatBox.scrollHeight; // Auto-scroll to the latest message
  }

  /**
   * Handles ending the chat by closing the peer connection and resetting the UI.
   */
  private handleEndChat(): void {
    this.peerConnectionHandler.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.localVideo.srcObject = null;
    this.remoteVideo.srcObject = null;
    this.resetUI();
    console.log("Chat ended");
  }

  /**
   * Toggles the microphone on or off.
   *
   * @param {boolean} unmute - Whether to unmute the microphone.
   */
  private toggleMic(unmute: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks()[0].enabled = unmute;
      this.muteButton.style.display = unmute ? "inline" : "none";
      this.unmuteButton.style.display = unmute ? "none" : "inline";
    }
  }

  /**
   * Updates the UI to show chat controls when a chat starts.
   */
  private updateUIForChatStart(): void {
    this.endButton.style.display = "inline";
    this.muteButton.style.display = "inline";
    this.sendFileButton.style.display = "inline";
  }

  /**
   * Resets the UI to its initial state.
   */
  private resetUI(): void {
    this.remoteUsernameLabel.textContent = "Remote User";
    this.chatBox.innerHTML = "";
    this.endButton.style.display = "none";
    this.muteButton.style.display = "none";
    this.unmuteButton.style.display = "none";
    this.sendFileButton.style.display = "none";
  }
}
