const db = require("../models");
const compareTimeDay = require("./helperFunctions").compareTimeDay;
const axios = require("axios");

module.exports = {
  // Get a game based on if 1 day has passed since the last time it was called from the api,
  // have a parameter called force to force call the api bypassing the 1 day restriction
  // Accepts array of gameids | Return array of objects

  getGames: function (appids, force) {
    return new Promise(async (resolve) => {
      let returnedGames = [];
      for (let i = 0; i < appids.length; i++) {
        if (!appids[i].match(/^[0-9]+$/)) {
          returnedGames.push({ appid: "Invalid AppID" });
          continue;
        }

        // Checking to see if the given appid exists in the db
        const found = await db.Games.findOne({ appid: appids[i] });
        if (found) {
          if (compareTimeDay(found.last_updated) && !force) {
            returnedGames.push(found);
            continue;
          }
        }

        let newGame = {};
        const steamApiInfo = await axios.get(
          "https://store.steampowered.com/api/appdetails?appids=" + appids[i]);
        const currentGameApi = steamApiInfo.data[appids[i]];

        if (!currentGameApi || !steamApiInfo.data[appids[i]].success) {
          returnedGames.push({ appid: "Invalid AppID" });
          continue;
        } else {
          const steamSpyInfo = await axios.get(
            "https://steamspy.com/api.php?request=appdetails&appid=" + appids[i]);
          const currentGameSpy = steamSpyInfo.data;

          // Setting relevant data to newGame object to push to db
          newGame.appid = currentGameApi.data.steam_appid;
          newGame.name = currentGameApi.data.name;
          newGame.appurl = "https://store.steampowered.com/app/" + newGame.appid;
          newGame.short_description = currentGameApi.data.short_description;
          newGame.header_image = currentGameApi.data.header_image;
          newGame.release_date = currentGameApi.data.release_date.date;
          newGame.developer = currentGameSpy.developer;
          newGame.publisher = currentGameSpy.publisher;
          newGame.positive = currentGameSpy.positive;
          newGame.negative = currentGameSpy.negative;
          newGame.owners = currentGameSpy.owners;
          newGame.average_forever = currentGameSpy.average_forever;
          newGame.average_2weeks = currentGameSpy.average_2weeks;
          newGame.median_forever = currentGameSpy.median_forever;
          newGame.median_2weeks = currentGameSpy.median_2weeks;
          newGame.ccu = currentGameSpy.ccu;
          newGame.genre = currentGameSpy.genre;

          // Checking to see if the game should be updated in the db or a new on should be created
          if (found) {
            // Updating last updated date
            newGame.last_updated = Date.now();
            const updated = await db.Games.findOneAndUpdate(
              { appid: found.appid },
              newGame,
              { new: true }
            );
            returnedGames.push(updated);
            continue;
          } else {
            const created = await db.Games.create(newGame);
            returnedGames.push(created);
            continue;
          }
        }
      }
      return resolve(returnedGames);
    });
  },
};
