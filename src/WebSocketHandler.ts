export default class WebSocketHandler {
  private ws: WebSocket;
  private handlers: { [key: string]: Function[] } = {};

  /**
   * Initializes a new WebSocketHandler.
   *
   * @param {string} url - The WebSocket server URL.
   */
  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.init();
  }

  /**
   * Initializes WebSocket event listeners.
   */
  private init(): void {
    this.ws.addEventListener("open", (e) => this.handleEvent("open", e));
    this.ws.addEventListener("error", (e) => this.handleEvent("error", e));
    this.ws.addEventListener("close", (e) => this.handleEvent("close", e));
    this.ws.addEventListener("message", (e) => this.handleEvent("message", e));
  }

  /**
   * Handles WebSocket events by invoking the corresponding handlers.
   *
   * @param {string} event - The event type.
   * @param {Event} e - The event object.
   */
  private handleEvent(event: string, e: Event): void {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler) => handler(e));
    }
  }

  /**
   * Adds a handler for a specific WebSocket event.
   *
   * @param {string} event - The event type.
   * @param {Function} handler - The handler function.
   */
  public on(event: string, handler: Function): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  /**
   * Sends data to the WebSocket server.
   *
   * @param {any} data - The data to send.
   */
  public send(data: any): void {
    this.ws.send(JSON.stringify(data));
  }
}
