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
const ranks = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const suits = ["hearts", "spades", "diamonds", "clubs"];

const getAllCards = (gameState) => {
  const myHoleCards = gameState.players.filter((p) => {
    if (p.hole_cards) return p.hole_cards;
  });
  return [...gameState.community_cards, ...myHoleCards];
};

const shouldRaiseBasedOnSuit = (allCards) => {
  const hearts = allCards.filter((c) => c.suit === "hearts");
  const spades = allCards.filter((c) => c.suit === "spades");
  const diamonds = allCards.filter((c) => c.suit === "diamonds");
  const clubs = allCards.filter((c) => c.suit === "clubs");

  const hasFourOfSameSuit =
    hearts.length > 3 ||
    spades.length > 3 ||
    diamonds.length > 3 ||
    clubs.length > 3;

  return hasFourOfSameSuit;
};

const getAllOccurrences = (allCards) => {
  const allRanks = allCards.map((c) => c.rank);

  const occurrences: Record<string, number> = ranks.reduce((acc, r) => {
    return { ...acc, [r]: allRanks.filter((ar) => ar === r).length };
  }, {});

  return occurrences;
};

const getPairs = (occurrences) => {
  const pairs = [];
  const triplets = [];
  const quadruplets = [];

  for (const [key, value] of Object.entries(occurrences)) {
    if (value === 2) pairs.push(key);
    if (value === 3) triplets.push(key);
    if (value === 4) quadruplets.push(key);
  }
  return { pairs, triplets, quadruplets };
};

function detectLargeBet(players: GamePlayer[]) {
  const opponent = players.find((p) => p.name === "Monks on Meth");
  const myPlayer = players.find((p) => p.name === "Budimir and The Mayas");
  const oppBet = opponent.bet;
  const currBet = myPlayer.bet;
  const oppStack = opponent.stack;
  const betDiff = oppBet - currBet;
  const betRatio = oppBet / currBet;
  if (oppStack < 20 && betDiff > 200) {
    return true;
  }
  if (betRatio >= 5 && betDiff > 100) {
    return true;
  }
}

const getStraight = (occurrences) => {
  const arrayToInspect = Object.values(occurrences)
  const arrayOfBools = arrayToInspect.map(item => Boolean(item))
  let isStraight = false;

  arrayOfBools.reduce((acc, current, index) => {
    // If already detected straight, just return 5
    if (acc === 5) {
      return 5
    }
    // If just forming straight, return 5
    if (acc === 4 && current === true) {
      isStraight = true;
      return 5 // We have it!
    }
    // If accumulator is in default/reset state, increase
    if (acc === 0 && current === true) {
      return 1
    }
    if (acc > 0 && current === true) {
      return acc + 1
    }
    if (acc > 0 || current === false) {
      return 0
    }
  }, 0)

  return isStraight
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
    // const currPot = gameState.pot;

    const hasLargeBet = detectLargeBet(players);

    if (currentBet === 0) {
      this.betStarting(holeCards, callAmt, minRaise, betCallback);
      return;
    }

    const allCards = getAllCards(gameState);
    if (allCards.length === 2) {
      this.betStarting(holeCards, callAmt, minRaise, betCallback);
      return;
    }
    // const raiseOnSuits = shouldRaiseBasedOnSuit(allCards);
    const allOccurrences = getAllOccurrences(allCards);
    const { pairs, triplets, quadruplets } = getPairs(allOccurrences);
    const hasPair = pairs.length === 1;
    // const hasTwoPairs = pairs.length === 2;
    const hasThreeOfAKind = triplets.length > 0;
    const hasFourOfAKind = quadruplets.length > 0;
    const hasFullHouse = hasThreeOfAKind && hasPair;
    const hasStraight = getStraight(allOccurrences)
    if (allCards.length === 5) {
      if (hasFourOfAKind) {
        betCallback(Math.ceil(callAmt + minRaise * 3));
        return;
      }
      if (hasFullHouse) {
        betCallback(Math.ceil(callAmt + minRaise * 2.5));
        return;
      }
    } else if (allCards.length === 6) {
      if (hasFourOfAKind) {
        betCallback(Math.ceil(callAmt + minRaise * 3.5));
        return;
      }
      if (hasFullHouse) {
        betCallback(Math.ceil(callAmt + minRaise * 3));
        return;
      }
    } else if (allCards.length === 7) {
      if (hasFourOfAKind) {
        betCallback(Math.ceil(callAmt + minRaise * 4));
        return;
      }
      if (hasFullHouse) {
        betCallback(Math.ceil(callAmt + minRaise * 3.5));
        return;
      }
    }

    if (hasLargeBet) {
      betCallback(0);
      return;
    }

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
          break;
      }
      return;
    }
    if (firstCard.suit === secondCard.suit) {
      if (firstCard.rank === "A" || secondCard.rank === "A") {
        if (firstCard.rank === "K" || secondCard.rank === "K") {
          //A+K suited
          betCallback(callAmt + minRaise * 4);
          return;
        }
        if (firstCard.rank === "Q" || secondCard.rank === "Q") {
          // A+Q suited
          betCallback(callAmt + minRaise * 3);
          return;
        }
        if (firstCard.rank === "J" || secondCard.rank === "J") {
          // A+J suited
          betCallback(callAmt + minRaise * 3);
          return;
        }
      }
    }
    if (firstCard.rank === "K" || secondCard.rank === "K") {
      if (firstCard.rank === "Q" || secondCard.rank === "Q") {
        // K+Q suited
        betCallback(callAmt + minRaise * 3);
        return;
      }
    }
    if (firstCard.rank === "A" || secondCard.rank === "A") {
      if (firstCard.rank === "K" || secondCard.rank === "K") {
        betCallback(callAmt + minRaise * 2);
        return;
      }
    }
    if (this.shouldFold(firstCard, secondCard)) {
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
