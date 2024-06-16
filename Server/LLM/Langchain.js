import { ChatOpenAI } from "@langchain/openai"
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

// const model = new ChatOpenAI({
//     azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, 
//     azureOpenAIApiVersion: process.env.OPENAI_API_VERSION, 
//     azureOpenAIApiInstanceName: process.env.INSTANCE_NAME, 
//     azureOpenAIApiDeploymentName: process.env.ENGINE_NAME, 
// })
console.log(process.env.ENGINE_NAME)
const model = new ChatOpenAI({
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
    engineName: process.env.ENGINE_NAME,
})

 
// async function joke() {
//     const res = await model.invoke("Tell me a Javascript joke!")
//     return res.content 
// }

// async function chat(req) {
//     const res = await model.invoke(req)
//     return res.content 
// }

// async function card(req) {
//     const res = await model.invoke(req)
//     return res.content 
// }

async function RPS(req) {
    const res = await model.invoke(req)
    console.log(res)
    return res.content 
}



export { RPS }