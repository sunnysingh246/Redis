import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.josn())

const redis = new Redis(process.env.REDIS_URL || "reddis://localhost:6379")

const BANNER_key = "app:banner";

app.post("/banner", async (req, res) => {
    await redis.set(BANNER_key, req.body.message || "welcome to reddis!!");
    res.josn({ success: true })
});

app.get("/banner", async (req, res) => {
    const message = await redis.get(BANNER_key);
    res.json({ message });
})

app.delete("/banner", async (req, res) => {
    await redis.del(BANNER_key);
    res.json({ success: true });
});

app.get("/banner/exist", async (req, res) => {
    const exists = await redis.exists(BANNER_key);
    res.json({ exists: Boolean(exists) })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})
