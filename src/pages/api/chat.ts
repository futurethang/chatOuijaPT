import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import type { NextApiRequest, NextApiResponse } from 'next'

dotenv.config();

type Data = {
    message: string
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = async () => {
    console.log('hello');
    const data = await openai.listModels()
    return data.data.data
};

// @ts-ignore
export default async function handler(req, res) {
    const { query } = req.body
    const message = await response()
    res.status(200).json(message)
    // const prompt = 'This is a test of GPT-3. ' + query;
    // const maxTokens = 5;
    // const temperature = 0.9;
    // const topP = 1;
    // const presencePenalty = 0;
    // const frequencyPenalty = 0;
    // const bestOf = 1;
    // const n = 1;
    // const stream = false;
}