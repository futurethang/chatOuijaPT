// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listModels();

type Data = {
  name: string
}

export function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}

// export function gpt3(req, res) {
//   const { query } = req.body
//   const openai = new OpenAIApi(process.env.OPENAI_API_KEY)
//   const prompt = 'This is a test of GPT-3. ' + query;
//   const maxTokens = 5;
//   const temperature = 0.9;
//   const topP = 1;
//   const presencePenalty = 0;
//   const frequencyPenalty = 0;
//   const bestOf = 1;
//   const n = 1;
//   const stream = false;
// }