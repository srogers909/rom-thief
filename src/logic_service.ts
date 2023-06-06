import color from "node-colorify";

/**
 * Gets the game title from the game url download page.
 * @param {string} gameUrl The url of a game download page.
 * @returns {string} Returns the string name of the game.
 */
export function getGameTitle(gameUrl: string): string {
    return gameUrl.substring((gameUrl.lastIndexOf("/") + 1));
}

/**
 * 
 * @param message 
 * @returns 
 */
export function log(message: string): any {
  return {
    console: () => {
      console.log(color.colorItSync(message, { fColor: 'white' }, { bColor: 'green' }));
    },
    success: () => {
      console.log(color.colorItSync(message, { fColor: 'green' }));
    },
    attention: () => {
      console.log(color.colorItSync(message, { fColor: "red" }));
    }
  }  
}