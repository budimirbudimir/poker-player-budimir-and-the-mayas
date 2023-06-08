export class Player {
  public betRequest(gameState: any, betCallback: (bet: number) => void): void {
    const currentBuyin = gameState.current_buy_in;
    const players = gameState.players;
    const playerIndex = gameState.in_action;
    const currentBet = players[playerIndex]["bet"];
    const callAmt = currentBuyin - currentBet;
    betCallback(callAmt);
  }

  public showdown(gameState: any): void {}
}

export default Player;
