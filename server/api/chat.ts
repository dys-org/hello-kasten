import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import { OpenAI } from 'openai';
import { z } from 'zod';

const chatRouter = new Hono();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID = 'asst_PySK0HSGdevF355BA6vO9WzS';

const MessageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(['user', 'assistant']),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
});

chatRouter.post('/chat', zValidator('json', ChatRequestSchema), async (c) => {
  const { messages } = c.req.valid('json');
  return streamText(
    c,
    async (stream) => {
      stream.onAbort(() => {
        console.log('Stream Aborted.');
      });
      const threadStream = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        thread: {
          messages: [
            {
              role: 'user',
              content: messages[messages.length - 1].content,
            },
          ],
        },
        stream: true,
      });

      for await (const chunk of threadStream) {
        if (
          chunk.event === 'thread.message.delta' &&
          chunk.data.delta.content?.[0].type === 'text'
        ) {
          await stream.write(chunk.data.delta.content?.[0].text?.value ?? '');
        }

        if (chunk.event === 'thread.run.completed') {
          await stream.close();
        }
        console.log(chunk);
      }
    },
    async (err, stream) => {
      await stream.writeln(`Error in chat stream: ${err.message}`);
      console.error(err);
      stream.abort();
    },
  );
});

export default chatRouter;
