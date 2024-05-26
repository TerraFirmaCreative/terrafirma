export type TaskNotification = {
  taskId: string,
  taskType: TaskType,
  taskStatus: TaskStatus,

}

export enum TaskType {
  Imagine,
  ImagineVariant
}

export enum TaskStatus {
  Queued,
  InProgress,
  Complete,
  Failed
}