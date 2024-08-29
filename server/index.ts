import 'dotenv/config'

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import chatRouter from './api/chat'

const app = new Hono()

app.route('/api', chatRouter)

console.log('Server is running on http://localhost:3000')

serve(app)
