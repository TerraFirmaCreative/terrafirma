import fs from "fs"

console.log("Copying assets...")
fs.cpSync("./src/email/templates", "./dist/email/templates", {recursive: true})
console.log("Done.")