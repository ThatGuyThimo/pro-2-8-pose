import express from 'express';
import { RPS } from '../../LLM/Langchain.js'
const router = express.Router()

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

let message = ['system', 'you are a rock paper scissors ai, i am using you as an api so you should only reply with only one of the following: rock, paper, scissors, you should respond when you get this message']

router.post('/', async (req, res) => {
    if (!req.body.message) {
        res.status(400).send('Message is required')
    } else {
        console.log(req.body.message)
        res.send(await RPS(req.body.message)).status(200)
        // res.send(await RPS('geuss rock paper or scissors')).status(200)
        // res.send("test message").status(200)
    }
})

export { router }