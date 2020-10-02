require("dotenv").config();

const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const app = express();
const hbs = require("hbs");

const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // redirectUri: process.env.redirectUri,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Handelbars

hbs.registerHelper("msToSeconds", function (millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
});

hbs.registerHelper("imageEmpty", function (images) {
  if (images === undefined) {
    return "https://www.nicomatic.com/themes/custom/jango_sub/img/no-image.png";
  } else {
    return images;
  }
});

// setting the spotify-api goes here:

// Our routes go here:

// app.get("/", (req, res) => {
//   res.render("login");
// });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artists", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then((data) => {
      console.log(data.body.artists);
      res.render("artist-search", { artists: data.body.artists });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res, next) => {
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then((data) => {
      console.log(data.body.items);
      res.render("album", { album: data.body.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/tracks/:albumId", (req, res, next) => {
  spotifyApi
    .getAlbumTracks(req.params.albumId)
    .then((data) => {
      // console.log("DATA", data);
      // console.log("DATA BODY", data.body);
      console.log("DATA BODY ITEMS", data.body.items);
      res.render("tracks", { tracks: data.body.items });
    })
    .catch((err) =>
      console.log("The error while searching tracks occurred: ", err)
    );
});

// app.listen(5000, () =>
//   console.log("My Spotify project running on port 5000 🎧 🥁 🎸 🔊")
// );
module.exports = app;
