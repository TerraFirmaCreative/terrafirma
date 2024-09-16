import express from "express"
import { mjClient } from "../config"
import { slowDown } from "express-slow-down"

export const router = express.Router()

router.use(slowDown({
  windowMs: 3000,
  delayAfter: 1,
  delayMs: (hits) => hits * 3000,
}))

// Can use this to find out if job should be queued
// BUT it means sending twice as many requests.
// Instead, we can wait for failure? 
// No, lets keep track of amount in another way.
router.route("").get(async (req, res) => {
  const info = await mjClient.Info()

  res.status(200).json(info)
})