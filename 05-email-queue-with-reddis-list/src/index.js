import express, { raw } from 'express'
import Redis from 'ioredis'
import { json } from 'node:stream/consumers';

const app = express()
app.use(express.json())

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY = 'queue:emails';

app.post("/emails", async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject || 'no subject',
        body: req.body.body || 'no content',
        createdAt: new Date().toISOString()
    }

    await redis.lpush(QUEUE_KEY, json.stringfy(job));
    res.json({ queued: true, job })
});

app.get('/emails/process-one', async (req, res) => {
    const rawJobs = await redis.rpop(QUEUE_KEY)

    if (!rawJobs) {
        return res.json({ message: "no jobs in queue" })
    }

    const job = json.parse(rawJobs)
    //simulate json sending
    res.json({ message: "Email sent", job });
});


app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000")
});