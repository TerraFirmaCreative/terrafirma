import express from "express"
import http from 'http'
import { router as adminRouter } from './api/admin'
import { router as tasksRouter } from './api/tasks'
import { logger, mjClient } from "./config"
import cookieParser from "cookie-parser"
import { prisma } from "./config"
import { getProductsById } from "./tasks/shopify"
import { MJMessage } from "midjourney"

const app = express()
const port: number = Number.parseInt(process.env.PORT ?? "3000")

app.use(express.json())
app.use(cookieParser(undefined)) // TODO: Sign cookies on frontend and use secret here
app.use(async (req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})


/**
 * User-queued tasks
 */
app.use('/tasks', tasksRouter)

/**
 * Admin API methods (avoid exposing to frontend when possible).
 */
app.use('/admin', adminRouter)

/**
 * Hello midjourney
 */
app.post('/', async (req, res) => {
  const Imagine: MJMessage | null = await mjClient.Imagine(req.body.prompt)

  res.json(Imagine?.uri)
})

/*
* LOCAL SSL START
*/
const server = http.createServer({
  // key: fs.readFileSync("./ssl/server.key"),
  // cert: fs.readFileSync("./ssl/server.cert")
}, app)
/*
* LOCAL SSL END
*/

async function main() {
  //Start server
  server.listen(port, () => {
    logger.info(`Listening on port ${port}`)
  })
}

main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})