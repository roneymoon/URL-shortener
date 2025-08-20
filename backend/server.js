const express = require("express")
const mongoose = require("mongoose")
const ShortUrl = require("./models/shortUrl")
const dotenv = require("dotenv");
const cors = require("cors")
const shortid = require("shortid")

dotenv.config();
const app = express()

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({extended: false}))

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> {
    console.log("MongoDB connected")
}).catch((err)=> {
    console.log(err)
})

app.get("/", (req, res)=> {

})

app.post("/shortUrls", async (req, res) => {
    if(!req.body.fullUrl){
        return res.status(400).json({error: "Please provide a URL"})
    }

    try{
        const short = shortid.generate()

        const newshortUrl = await ShortUrl.create({
            fullUrl: req.body.fullUrl,
            shortUrl: short,
            clicks: 0
        })

        res.status(201).json(newshortUrl)
        res.redirect("/")
    }catch(err){
        console.log(err)
    }
})

app.get("/:shortUrl", async (req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({shortUrl: req.params.shortUrl})
        if(!shortUrl){
            return res.status(404).json({error: "Short URL not found"})
        }
        shortUrl.clicks++
        await shortUrl.save()
        res.redirect(shortUrl.fullUrl)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An unexpected error occurred." });
    }
})

app.listen(3000, ()=> {
    console.log("Server and mongodb started on port 3000")
})