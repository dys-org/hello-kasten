import { Hono } from 'hono'
import { OpenAI } from 'openai'
import { z } from 'zod'

const chatRouter = new Hono()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ASSISTANT_ID = 'asst_PySK0HSGdevF355BA6vO9WzS'

const MessageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(['user', 'assistant'])
})

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema)
})

chatRouter.post('/chat', async (c) => {
  const body = await c.req.json()
  const { messages } = ChatRequestSchema.parse(body)

  try {
    const thread = await openai.beta.threads.create()
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: messages[messages.length - 1].content
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    })

    // Poll for completion
    let response
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id)
        const content = messages.data[0].content[0]
        response = 'text' in content ? content.text.value : 'Image content'
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return c.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    return c.json({ error: 'An error occurred while processing your request' }, 500)
  }
})

export default chatRouter
