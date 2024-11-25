import { TaskStatus } from "@prisma/client"
import { logger, socket } from "../config"


export const notifyTaskUpdate = async (taskId: string, status: TaskStatus) => {
  logger.debug(`notifyTaskUpdate() ${taskId}`)
  const notifyWS = () => {
    socket.emit("task-update", taskId, status)

    logger.debug("Emitted")
  }

  if (!socket.connected) {
    socket.io.open((err) => {
      if (err) {
        logger.error(`WS socket failed! ${err}`)
      }
      else {
        notifyWS()
      }
    })
  }
  else {
    notifyWS()
  }
}