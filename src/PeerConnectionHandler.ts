export default class PeerConnectionHandler {
  private peerConnection: RTCPeerConnection;
  private remoteVideo: HTMLVideoElement;

  /**
   * Initializes a new PeerConnectionHandler.
   *
   * @param {HTMLVideoElement} remoteVideo - The remote video element.
   */
  constructor(remoteVideo: HTMLVideoElement) {
    this.peerConnection = new RTCPeerConnection();
    this.remoteVideo = remoteVideo;
    this.init();
  }

  /**
   * Initializes the RTCPeerConnection event listeners.
   * These event listeners are fundamental for WebRTC connection establishment
   * and media handling
   */
  private init(): void {
    // Handles ICE candidate generation for establishing peer-to-peer connection
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      // When a new ICE candidate is available, it triggers the onIceCandidate
      // callback for signaling
      if (event.candidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Manages incoming media streams from the remote peer
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (this.remoteVideo.srcObject !== event.streams[0]) {
        // When a new track is received, it assigns the stream to the remote
        // video element, enabling the display of the remote peer's video
        this.remoteVideo.srcObject = event.streams[0];
      }
    };
  }

  /**
   * Handler for ICE candidate events. Should be overridden.
   *
   * @param {RTCIceCandidate} candidate - The ICE candidate.
   */
  public onIceCandidate(candidate: RTCIceCandidate): void {}

  /**
   * Adds a media stream to the peer connection.
   *
   * @param {MediaStream} stream - The media stream to add.
   */
  public addStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => this.peerConnection.addTrack(track, stream));
  }

  /**
   * Creates an offer for the peer connection.
   *
   * @returns {Promise<RTCSessionDescriptionInit>} The created offer.
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Creates an answer for the peer connection.
   *
   * @returns {Promise<RTCSessionDescriptionInit>} The created answer.
   */
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Sets the remote description for the peer connection.
   *
   * @param {RTCSessionDescriptionInit} description - The remote description.
   */
  public async setRemoteDescription(
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    );
  }

  /**
   * Adds an ICE candidate to the peer connection.
   *
   * @param {RTCIceCandidateInit} candidate - The ICE candidate.
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Closes the peer connection.
   */
  public close(): void {
    this.peerConnection.close();
  }
}
