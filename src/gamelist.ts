
(() => {
    const fs: any = require("fs");
    const path: any = require("path");

    const sourceDir = "D:\\Games\\OLDSCHOOL\\Nintendo\\games";
    const gameList = new Array<string>();

    function FormatGame(gameList: Array<string>): string {
        let games: string = "";

        for (let i = 0; i <= (gameList.length - 1); i++) {
            games += gameList[i].replace(",", "") + "\n";
        }

        return games;
    }

    fs.readdir(sourceDir, (err, files) => {
        if (!err) {
            files.forEach((file) => {
                gameList.push(file);
            });

            fs.writeFile(path.join(sourceDir, "gamelist.txt"), FormatGame(gameList), (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });
        }         
    });
})();