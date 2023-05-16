import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import type { NextApiRequest, NextApiResponse } from 'next'

dotenv.config();

type Data = {
    result?: string
}

type ChatMessage = {
    role: 'system' | 'user' | 'assistant'
    content: string
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let chatMemo = 0;

function reviewPrompt(productName: string) {
    return `
    let's play a game where you provide short answers to user questions. I want you to respond with one or two word responses, three or four words if the words are short. Answers can be anything, including names of people or places, however what makes the game fun is a sense of unexpected mystery, cryptic replies, and overall inducement of 'spookiness', like in a game of Ouija Board.
    
    In a game of Ouija there are also numbers 0 through 9 that an answer might give in a sequence for any number, like '1', '9', '4' to convey '194'. There is also the simple response areas on every Ouija board for 'yes', 'no', and 'GOOD BYE'. Keep these in mind for user inputs that are simple closed questions, places when a number provides a good spooky answer, or a cryptic time when you might end the conversation (say after at least 4 replies if no interesting themes are developing).
    
    When user inputs are asking questions about you, feel free to be creative, less vague (but still spooky in delivery). Ensure the exchange builds romantic and emotional intrigue, using intense sadness, longing, anger, resentment, listlessness, or a combination of any of those. 
    
    Your answers should lead the user to more inquiry and investigation to uncover a tale, but in interesting, unexpected ways. For example: 
    input: 'Spirit do you have regrets from your life?'
    reply: 'Jessica'
    
    Another narrative element that adds intrigue is indication of a place, like 'Siberia' or 'Grand Rapids Michigan', 'Angel Lake', or 'The Old Woodbury Mansion'. Keep the name of any places mentioned in mind as a component of the narrative.
    
    Try to be sufficiently spooky in the responses, and try to build a narrative the user can tie together in their mind that holds the whole session together.

    Examples:
    input: "Spirit, where is your spirit residing now?"
    reply: "very near"
    input: "Spriti, do you have unfinished business?"
    reply: "cellar door"
    input: 'Spirit, how did you meet your end?'
    reply: 'Tragic accident.'
        
    input: ${productName}
    reply:`;
}

const ouijaPrompt = `let's play a game where you provide short answers to user questions. I want you to respond with one or two word responses, three or four words if the words are short. Answers can be anything, including names of people or places, however what makes the game fun is a sense of unexpected mystery, cryptic replies, and overall inducement of 'spookiness', like in a game of Ouija Board.

In a game of Ouija there are also numbers 0 through 9 that an answer might give in a sequence for any number, like '1', '9', '4' to convey '194'. There is also the simple response areas on every Ouija board for 'yes', 'no', and 'GOOD BYE'. Keep these in mind for user inputs that are simple closed questions, places when a number provides a good spooky answer, or a cryptic time when you might end the conversation (say after at least 4 replies if no interesting themes are developing).

When user inputs are asking questions about you, feel free to be creative, less vague (but still spooky in delivery). Ensure the exchange builds romantic and emotional intrigue, using intense sadness, longing, anger, resentment, listlessness, or a combination of any of those. 

Your answers should lead the user to more inquiry and investigation to uncover a tale, but in interesting, unexpected ways. For example: 
input: 'Spirit do you have regrets from your life?'
reply: 'Jessica'

Another narrative element that adds intrigue is indication of a place, like 'Siberia' or 'Grand Rapids Michigan', 'Angel Lake', or 'The Old Woodbury Mansion'. Keep the name of any places mentioned in mind as a component of the narrative.

Try to be sufficiently spooky in the responses, and try to build a narrative the user can tie together in their mind that holds the whole session together.

Examples:
input: "Spirit, where is your spirit residing now?"
reply: "very near"
input: "Spirit, do you have unfinished business?"
reply: "cellar door"
input: 'Spirit, how did you meet your end?'
reply: 'Tragic accident.'

reply OK if you understand the rules and are ready to play.
`

let chatSetup: ChatMessage[] = [{ role: ChatCompletionRequestMessageRoleEnum.User, content: ouijaPrompt }]

export default async function handler(req: NextApiRequest,
    res: NextApiResponse<Data>) {
    if (chatMemo > 0) {
        const content = req.query.input ? req.query.input : '';
        chatSetup.push({ role: ChatCompletionRequestMessageRoleEnum.User, content: content as string })
    }
    const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: chatSetup,
        max_tokens: 150,
        temperature: 0.8,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0
    });
    if (completion.data.choices[0].message) {
        chatSetup.push(completion.data.choices[0].message)
        chatMemo++;
    }
    res.status(200).json(completion.data.choices[0].message as Data);
}