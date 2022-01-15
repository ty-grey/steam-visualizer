require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const exphbs = require("express-handlebars");
const app = express();
const PORT = process.env.PORT || 3001;

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Passport initialization
require("./config/steam")(app);

// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/steam-visualizer"
);
// Allowing deprecated command of findOneAndUpdate etc.
mongoose.set("useFindAndModify", false);

app.listen(PORT, function () {
  console.log("API Server now listening on PORT ${PORT}!");
});
