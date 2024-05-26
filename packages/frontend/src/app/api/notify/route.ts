import { TaskStatus, TaskType } from "@/lib/types/task"
import { NextRequest } from "next/server"

export type TaskNotification = {
  taskId: string,
  taskType: TaskType,
  taskStatus: TaskStatus,

}

export async function POST(req: NextRequest) {

}