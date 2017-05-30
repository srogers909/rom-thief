# RomThief
### Screen scrapes the planetemu.com website and downloads games.  Nothing illegal, just that I'm lazy and I like old nintendo games.  :)

## Setup
* Using the node command line *(I use git bash, but to each their own)*

* Install the required node modules.
   * `npm install`

* Compile the romthief typescript file.
   * `tsc src/romthief.ts`
   * builds a javascript file *(romthief.js)* in the src directory (for now).

## Execution

`node src/romthief.js <game system: string> <page index: number>`

### Game Systems
* Nintendo NES = **nintendo-nes**
* Super Nintendo = **nintendo-super-nes**
* Atari 2600 = **atari-2600**
* Atari 5200 = **atari-5200**
* Atari 7800 = **atari-7800**
* Game Boy = **nintendo-game-boy**
* Nintendo 64 = **nintendo-nintendo-64**

### Page Index
* The array index for **0** through **26**.
   * Pages 0-9 = index 0.
   * Page A = index 1. 
   * etc.

### Example
* `node src/romthief.js "nintendo-nes" 0`
   * Downloads the first page of the NES page.

### Known Issues
* Timeout issues with downloading large games.  Working on it.
* No configuration for location saving.  Will be adding that in the next version.