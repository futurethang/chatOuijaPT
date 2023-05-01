import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import type { NextApiRequest, NextApiResponse } from 'next'

dotenv.config();

type Data = {
    result?: string
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function reviewPrompt(productName: string) {
    return `Topic: Breakfast
    Two-Sentence Horror Story: He always stops crying when I pour the milk on his cereal. I just have to remember not to let him see his face on the carton.
        
    Topic: ${productName}
    Two-Sentence Horror Story:`;
}

export default async function handler(req: NextApiRequest,
    res: NextApiResponse<Data>) {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: reviewPrompt(req.query.input as string),
        max_tokens: 150,
        temperature: 0.8,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0
    });
    console.log('fart')
    res.status(200).json({ result: completion.data.choices[0].text });
}