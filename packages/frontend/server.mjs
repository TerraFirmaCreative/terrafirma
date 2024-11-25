import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NEXT_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // TODO: Secure websockets (CORS might already handle this)
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Connected")
    socket.on("subscribe", (taskId, callback) => {
      socket.join(taskId)
      callback(`Joined Room ${taskId}`)
    })

    socket.on("unsubscribe", (taskId, callback) => {
      socket.leave(taskId)
      callback(`Left Room ${taskId}`)
    })

    socket.on("task-update", (taskId, status) => {
      io.to(taskId).emit("task-update", status)
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});