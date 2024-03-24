import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL);

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
