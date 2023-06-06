import * as config from './config.json';
import { getGameTitle } from './logic_service';

const promise = require('request-promise');
const $ = require('cheerio');
const q: any = require("bluebird");
const fs = require('fs');

// houses the game titles per page.
let gameTitles: Array<string> = [];

const activeSystem: string = process.argv[2] || config.defaultGameSystem;
const activeGamePage: string = process.argv[3] || '0';

console.log('RomTheif begins');

const fetchUrl: string = `${config.hostUrl}/${config.romList}/${activeSystem}?page=${config.romPages[activeGamePage]}`;

promise(fetchUrl)
  .then((response: any) => {
    let gameList: Array<string> = [];
    let body: any = $.load(response);

    const gameValues: Array<string> = [];
    const gameValueArray: Array<string> = [];

    const contents: any = body(".content").find(".rompair, .romimpair");

    for (const content of contents) {
      const item = 
          body(content).find("td").find("a").attr("href");

      gameList.push(config.hostUrl + item);
      gameTitles.push(getGameTitle(item));
    }
  })
  .then(gamelist => {
    let valueArray: Array<string> = [];
    let valuePromiseArray: Array<Promise<string>> = [];

    for (let i = 0; i <= (gamelist.length - 1); i++) {
        valuePromiseArray.push(promise(gamelist[i]));
    }

    /**
             * Gets the hidden input element "id" and stores the value in an array.
             * These values will be used in the "gameValues" callback.
             */
    q.all(valuePromiseArray)
      .then(bodyArray => {
          for (let i = 0; i <= (bodyArray.length - 1); i++) {
              const formValue = $.load(bodyArray[i]);
              const value: string = 
                  formValue(".downloadForm")
                      .children("input[type=hidden]").attr("value");

              valueArray.push(value);
          }

          console.log("Game values retrieved.");

          return valueArray;
      })
      .then(gameValues => {
          /**
           * Spoofing the HTML POST forms for each game and constructing an array of promises.
           */
          let gamesArray = new Array<Promise<any>>();

          /**
           * IMPORTANT... planetemu's inital POST is a 302 HTTP status so "followAllRedirects" is required. <p/>
           * Additionally, setting encoding to NULL is required as the request module wants to coerce the <p/>
           * body to a string.  Nope... I want the binary stream that ends up being a zip file.
           */
          for (let i = 0; i <= (gameValues.length - 1); i++) {
              let postRequest = {
                  method: "POST",
                  uri: config.downloadUrl,
                  resolveWithFullResponse: true,
                  followAllRedirects: true,
                  encoding: null,
                  timeout: 320000,
                  form: {
                      "id": gameValues[i]
                  }
              };
              
              gamesArray.push(promise(postRequest));
          }

          q.settle(gamesArray)
              .then(response => {                            
                  console.log("Downloads begin");

                  for (let i = 0; i <= (response.length - 1); i++) {
                      if (response[i].body) {

                          try {
                              const gamePath: string = `${config.saveDirectory}${gameTitles[i]}.zip`;

                              /**
                               * Writes each file to the gamePath in it's raw format.
                               */
                              fs.writeFile(gamePath, response[i].body, (err: any) => {
                                  console.log(`Game (${gameTitles[i]}) saved.`);    
                              });
                          } catch (ex) {
                              console.error(ex);
                          }
                      }
                  }
              });
      })
    .catch(error => {
        console.error(error)
    });
  });