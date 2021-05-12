require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const lyricsFinder = require('lyrics-finder')
const port = 'https://spotify-by-smith.herokuapp.com/'
// Spotify w/ capital 's' to clarify that this is a class we are creating
const SpotifyWebApi = require('spotify-web-api-node')
const app = express();
// fixes the CORS errors we got
app.use(cors())
// app.use(bodyParser.json())
app.use(express.json())
// this allows us to parse the url parameters since it is happening in a GET request below
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        // will add this to an .env file since hard-coding it in the server is not secure
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    })

    spotifyApi
    .refreshAccessToken()
    .then(data => {
        res.json({
            accessToken: data.body.accessToken,
            expiresIn: data.body.expiresIn
        })
    })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

app.post('/login', (req, res) => {
    // the code that's returned as a query parameter to the redirect URI
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        // will add this to an .env file since hard-coding it in the server is not secure
        clientSecret: process.env.CLIENT_SECRET,
    })

    spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
        // respond with error if for some reason there is a problem retrieving the access & refresh tokens
    })
    .catch(error => {
        res.sendStatus(400)
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = 
    (await lyricsFinder(req.query.artist, req.query.track)) || "No lyrics found."
    res.json({ lyrics })
})

app.listen(port)