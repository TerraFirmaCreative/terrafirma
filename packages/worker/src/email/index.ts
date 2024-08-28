import handlebars from "handlebars"
import fs from "fs"
import path from "path"

const taskDoneHtml = fs.readFileSync(path.resolve(__dirname, "./templates/task-done.html")).toString()

export const taskDoneTemplate = handlebars.compile(taskDoneHtml)