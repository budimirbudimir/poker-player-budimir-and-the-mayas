interface Card {
  rank: string;
  suit: string;
}

interface GamePlayer {
  id: number;
  name: string;
  status: string;
  version: string;
  stack: number;
  bet: number;
  hole_cards?: Card[];
}

interface Game {
  tournament_id: string;
  game_id: string;
  round: number;
  bet_index: number;
  small_blind: number;
  current_buy_in: number;
  pot: number;
  minimum_raise: number;
  dealer: number;
  orbits: number;
  in_action: number;
  players: GamePlayer[];
  community_cards: Card[];
}

export class Player {
  public betRequest(gameState: Game, betCallback: (bet: number) => void): void {
    const currentBuyin = gameState.current_buy_in;
    const players = gameState.players;
    const playerIndex = gameState.in_action;
    const currentBet = players[playerIndex]["bet"];
    const callAmt = currentBuyin - currentBet;
    const minRaise = gameState.minimum_raise;
    const holeCards = gameState.players[playerIndex]["hole_cards"];

    this.betStarting(holeCards, callAmt, minRaise, betCallback);

    betCallback(callAmt);
  }

  private betStarting(
    holeCards: any,
    callAmt: number,
    minRaise: number,
    betCallback: (bet: number) => void
  ): void {
    const firstCard = holeCards[0];
    const secondCard = holeCards[1];

    if (firstCard.rank === secondCard.rank) {
      switch (firstCard.rank) {
        case "A":
          betCallback(callAmt + minRaise * 6);
          break;
        case "K":
          betCallback(callAmt + minRaise * 5);
          break;
        case "Q":
          betCallback(callAmt + minRaise * 4);
          break;
        case "J":
          betCallback(callAmt + minRaise * 3);
          break;
        case "10":
          betCallback(callAmt + minRaise * 2);
          break;
        default:
          betCallback(callAmt + minRaise);
      }
    } else if (firstCard.suit === secondCard.suit) {
      if (firstCard.rank === "A" || secondCard.rank === "A") {
        if (firstCard.rank === "K" || secondCard.rank === "K") {
          //A+K suited
          betCallback(callAmt + minRaise * 4);
        }
        if (firstCard.rank === "Q" || secondCard.rank === "Q") {
          // A+Q suited
          betCallback(callAmt + minRaise * 3);
        }
        if (firstCard.rank === "J" || secondCard.rank === "J") {
          // A+J suited
          betCallback(callAmt + minRaise * 3);
        }
      }
    } else if (firstCard.rank === "K" || secondCard.rank === "K") {
      if (firstCard.rank === "Q" || secondCard.rank === "Q") {
        // K+Q suited
        betCallback(callAmt + minRaise * 3);
      }
    } else if (
      (firstCard.rank === "A" || firstCard.rank === "K") &&
      (secondCard.rank === "A" || secondCard.rank === "K")
    ) {
      betCallback(callAmt + minRaise * 2);
    } else if (this.shouldFold(firstCard, secondCard)) {
      betCallback(0);
    } else {
      betCallback(callAmt);
    }
  }

  shouldFold = (firstCard: Card, secondCard: Card): boolean => {
    const ranks = [+firstCard.rank, +secondCard.rank].sort();

    if (ranks[0] === 2 && ranks[1] === 6) return true;
    if (ranks[0] === 2 && ranks[1] === 7) return true;
    if (ranks[0] === 2 && ranks[1] === 8) return true;
    if (ranks[0] === 2 && ranks[1] === 9) return true;
    if (ranks[0] === 2 && ranks[1] === 10) return true;

    if (ranks[0] === 3 && ranks[1] === 7) return true;
    if (ranks[0] === 3 && ranks[1] === 9) return true;

    if (ranks[0] === 4 && ranks[1] === 7) return true;
    if (ranks[0] === 4 && ranks[1] === 8) return true;
    if (ranks[0] === 4 && ranks[1] === 9) return true;

    return false;
  };

  public showdown(gameState: Game): void {}
}

export default Player;
