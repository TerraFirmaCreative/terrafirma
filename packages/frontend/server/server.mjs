import { createServer } from "node:http"
import next from "next"
import { Server } from "socket.io"
// import config from './.next/required-server-files.json' assert {type: "json"}

const dev = process.env.NODE_ENV !== 'production'
const hostname = "localhost"
const port = 3000

if (process.env.DEPLOY_ENV != 'local') {
  const config = await import('../.next/required-server-files.json', { assert: { type: "json" } })
  const nextConfig = config.config
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)
}

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer)

  io.on("connection", (socket) => {
    console.log("Socket connected")
    socket.
  })

  httpServer
    .once("error", (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})