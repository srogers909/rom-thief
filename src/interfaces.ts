export interface ILogicService {
    getGameTitle(gameUrl: string): string;
    log(message: string): any;
}