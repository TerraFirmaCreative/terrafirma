import express from "express"
import { router as imagineRouter } from "./imagine"

export const router = express.Router()

router.use("/imagine", imagineRouter)
