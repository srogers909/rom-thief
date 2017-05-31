/**
 * RomThief v1.1.0
 * 
 * Specific to www.planetemu.net.  <p/>
 * Screen scrapes the HTML, retrieves the game values and downloads each game by page.
 * 
 * Execution:
 * node main.js <system> <pageIndex>
 * ex. node main.js "nintendo-nes" 0
 * Gets the first page of games for the nintendo nes system.
 * 
 * Defaults are "nintendo-nes" and the 0 index page.
 */

const fs: any = require("fs");
const path: any = require("path");
const request: any = require("request");
const promise: any = require("request-promise");
const $: any = require("cheerio");
const q: any = require("bluebird");
const color: any = require("node-colorify");

const hostUrl: string = "http://www.planetemu.net";
const romList: string = "roms";
const romSinglePage: string = "rom";
const downloadUrl: string = "http://www.planetemu.net/php/roms/download.php";

const PAGES = new Array<string>("0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");

(process => {
    // command line property.    
    const activeSystem = process.argv[2] || "nintendo-nes";
    const activeGamePage = process.argv[3] || 0;

    console.log(
        color.colorItSync("RomTheif begins", { fColor: "white" }, { bColor: "green" })
    );

    // houses the game titles per page.
    let _gameTitles = new Array<string>();

    /**
     * Gets the game title from the game url download page.
     * @param {string} gameUrl The url of a game download page.
     * @returns {string} Returns the string name of the game.
     */
    function GetGameTitle(gameUrl: string): string {
        return gameUrl.substring((gameUrl.lastIndexOf("/") + 1));
    }

    /**
     * For now... I'm only downloading on a page-by-page basis of a single game system. <p/>
     * Not looping through each page just to be nice to the hosting server. <p/>
     * For now... just change the array iterator based on which page you wish to download. <p/>
     * ex. PAGES[some number].  See the PAGES array above.
     */
    promise(`${hostUrl}/${romList}/${activeSystem}?page=${PAGES[activeGamePage]}`)
        .then(htmlBody => {
            let gameList = new Array<string>();            
            let body = $.load(htmlBody);
        
            const _gameValues = new Array<string>();
            const gameValueArray = new Array<string>();

            console.log(
                color.colorItSync("Game url list retrieved.", { fColor: "green" })
            );

            const contents: any = 
                body(".content").find(".rompair, .romimpair");

            for (const content of contents) {
                const item = 
                    body(content).find("td").find("a").attr("href");

                gameList.push(hostUrl + item);
                _gameTitles.push(GetGameTitle(item));
            }

            // send the game list to the callback block below.
            return gameList;
        })
        .then(gameList => {
            let valueArray = new Array<string>();
            let valuePromiseArray = new Array<Promise<string>>();

            for (let i = 0; i <= (gameList.length - 1); i++) {
                valuePromiseArray.push(promise(gameList[i]));
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

                    console.log(
                        color.colorItSync("Game values retrieved.", { "fColor": "green" })
                    );

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
                            uri: downloadUrl,
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
                            console.log(
                                color.colorItSync("Downloads begin", { fColor: "green" })
                            );

                            /*let rejections = response.filter(el => { return el.isRejected(); });

                            for (let i = 0; i <= (rejections.length - 1); i++) {
                                console.log(rejections[i].reason());
                            }*/

                            for (let i = 0; i <= (response.length - 1); i++) {
                                if (response[i].body) {

                                    try {
                                        const gamePath = `D:\\romthief-games\\${_gameTitles[i]}.zip`;

                                        /**
                                         * Writes each file to the gamePath in it's raw format.
                                         */
                                        fs.writeFile(gamePath, response[i].body, (err) => {
                                            console.log(
                                                color.colorItSync(
                                                    "Game (" + _gameTitles[i] + ") saved.", { fColor: "green" }
                                                )
                                            );    
                                        });
                                    } catch (ex) {
                                        console.error(
                                            color.colorItSync((<Error>ex), { fColor: "red" })
                                        );
                                    }
                                }
                            }
                        });
                })
                .catch(error => {
                    console.error(
                        color.colorItSync(error, { fColor: "red" })
                    );
                });                
        })
        .catch(error => {
            // need to do something more useful with this.
            console.error(
                color.colorItSync(error, { fColor: "red" })
            );
        });
})(process);