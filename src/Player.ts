export class Player {
  public betRequest(gameState: any, betCallback: (bet: number) => void): void {
    const currentBuyin = gameState.current_buy_in;
    const players = gameState.players;
    const playerIndex = gameState.in_action;
    const currentBet = players[playerIndex]["bet"];
    const callAmt = currentBuyin - currentBet;
    const minRaise = gameState.minimum_raise;
    const holeCards = gameState.players[playerIndex]["hole_cards"];

    this.betStarting(holeCards, callAmt, minRaise, betCallback);
  }

  private betStarting(
    holeCards: any,
    callAmt: number,
    minRaise: number,
    betCallback: (bet: number) => void
  ): void {
    const firstCard = holeCards[0];
    const secondCard = holeCards[1];

    switch (holeCards) {
      case firstCard.rank === secondCard.rank:
        switch (firstCard.rank) {
          case "A":
            betCallback(callAmt + minRaise * 3);
            break;
          case "K":
            betCallback(callAmt + minRaise * 2);
            break;
          case "Q":
            betCallback(callAmt + minRaise * 2);
            break;
          case "J":
            betCallback(callAmt + minRaise);
            break;
          case "10":
            betCallback(callAmt + minRaise);
            break;
          default:
            betCallback(callAmt);
        }
        break;
      case firstCard.suit === secondCard.suit:
        if (firstCard.rank === "A" || secondCard.rank === "A") {
          if (firstCard.rank === "K" || secondCard.rank === "K") {
            //A+K suited
            betCallback(callAmt + minRaise * 2);
          }
          if (firstCard.rank === "Q" || secondCard.rank === "Q") {
            // A+Q suited
            betCallback(callAmt + minRaise * 2);
          }
          if (firstCard.rank === "J" || secondCard.rank === "J") {
            // A+J suited
            betCallback(callAmt + minRaise);
          }
        } else if (firstCard.rank === "K" || secondCard.rank === "K") {
          if (firstCard.rank === "Q" || secondCard.rank === "Q") {
            // K+Q suited
            betCallback(callAmt + minRaise);
          }
        } else {
          betCallback(callAmt);
        }
        break;
      case (firstCard.rank === "A" || firstCard.rank === "K") &&
        (secondCard.rank === "A" || secondCard.rank === "K"):
        betCallback(callAmt);
        break;
      default:
        betCallback(callAmt);
    }
  }

  public showdown(gameState: any): void {}
}

export default Player;
