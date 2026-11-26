import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')


function optKey(phone) {
    return `otp:${phone}`
}


app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(optKey(phone), otp, 'EX', 30);        //OTP valid for 30 seconds
    return res.json({ message: "OTP sent", otp })
});


app.post('/otpVerify', async (req, res) => {
    const { phone, otp } = req.body;
    const savedOtp = redis.get(optKey(phone));

    if (!savedOtp) {
        return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (savedOtp !== otp) {
        return res.status(400).json({ message: "Invalid otp" })
    }

    await redis.del(optKey(phone))
    res.json({ message: "OTP verified successfully" });
});

app.get('/otp/:phone/ttl', async (req, res) => {
    const ttl = await redis.ttl(optKey(req.params.phone));
    res.json({ ttl });
});


app.listen(3000, () => {
    console.log("Server is running on port http://localhost3000")
});