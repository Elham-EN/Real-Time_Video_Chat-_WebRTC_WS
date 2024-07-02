Real-Time Video Chat Application

## Overview

This project is a real-time video chat application built with vanilla JavaScript using TypeScript, WebSocket, and WebRTC. It allows users to communicate via video, audio, and text chat. The application supports features such as file sharing and managing user interactions using WebRTC and WebSocket.

The application follows best practices for scalable and maintainable code by leveraging Object-Oriented Programming (OOP), decomposition, separation of concerns, and modularity. This approach ensures the codebase is clean, easy to read, and scalable.

## Features

- Real-time video and audio communication using WebRTC.
- Text chat functionality.
- File sharing within the chat.
- Mute and unmute microphone.
- Display usernames for local and remote users.
- Responsive and user-friendly UI.

## Technologies Used

- Frontend:
- HTML
- CSS
- TypeScript

- Backend:
  - Node.js
  - WebSocket
  - HTTP
- Tools:
  - TypeScript
  - Webpack
  - Nodemon

## Project Structure:

```
backend/
│
├── dist/
│   └── index.js
├── node_modules/
├── src/
│   ├── index.ts
│   ├── WebSocketHandler.ts
│   ├── PeerConnectionHandler.ts
│   └── ChatUIHandler.ts
├── public/
│   ├── index.html
│   ├── styles.css
├── package.json
├── tsconfig.json
└── webpack.config.js

```

## How to Run the App

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository or Download zip file
2. Install dependencies:

```
npm install
```

3. Build the project:

```
npm run build
```

### Running the App

1. Development mode with live reload:

```
npm run dev
```

2. Open your browser and navigate to:

```
http://localhost:3000

```
