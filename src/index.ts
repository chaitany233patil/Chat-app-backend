import { WebSocketServer, WebSocket } from "ws";

interface socketProps {
  [key: string]: WebSocket[];
}

const allSockets: socketProps = {};

function getRoomId() {
  const hash = "qwertyuioplkjhgfdaszxcvbnmMNBVCXZDSFAGHJKLPOIUYTREWQ";
  let roomId = "";
  for (let i = 0; i < 7; i++) {
    roomId += hash[Math.floor(Math.random() * hash.length)];
  }
  return roomId;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (data) => {
    try {
      const parseData = JSON.parse(data.toString());
      if (parseData.type === "create") {
        const roomId = getRoomId();
        allSockets[roomId] = [];
        socket.send(
          JSON.stringify({
            type: "create",
            payload: {
              roomId: roomId,
            },
          })
        );
      }

      if (parseData.type == "join") {
        const roomId = parseData.payload.roomId;
        if (roomId in allSockets) {
          allSockets[roomId].push(socket);
          socket.send(
            JSON.stringify({
              type: "join",
            })
          );
        }
      }

      if (parseData.type == "typing") {
        const roomId = parseData.payload.roomId;
        if (roomId in allSockets) {
          allSockets[roomId].forEach((socket) => {
            socket.send(
              JSON.stringify({
                type: "Typing",
                username: parseData.payload.username,
              })
            );
          });
        }
      }

      if (parseData.type == "chat") {
        const roomId = parseData.payload.roomId;
        if (roomId in allSockets) {
          allSockets[roomId].forEach((socket) => {
            socket.send(
              JSON.stringify({
                type: "chat",
                payload: {
                  username: parseData.payload.username,
                  message: parseData.payload.message,
                },
              })
            );
          });
        }
      }
    } catch (e) {
      console.log("ERROR");
    }
  });
});

console.log("WebSocket server started on ws://localhost:8080");
