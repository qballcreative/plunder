import { create } from 'zustand';
import {
  GameState,
  Card,
  CardType,
  GoodsType,
  Token,
  BonusToken,
  Player,
  Difficulty,
  OptionalRules,
  HiddenTreasure,
  INITIAL_TOKEN_VALUES,
  BONUS_THREE_VALUES,
  BONUS_FOUR_VALUES,
  BONUS_FIVE_VALUES,
  DECK_COMPOSITION,
  HAND_LIMIT,
  MARKET_SIZE,
  MIN_SELL_EXPENSIVE,
} from '@/types/game';

// Pirate names for AI opponent
const PIRATE_NAMES = [
  "Blackbeard the Bold",
  "Captain Crimson",
  "Salty Pete",
  "One-Eyed Jack",
  "Stormy Sally",
  "Red Rackham",
  "Barnacle Bill",
  "Dread Pirate Roberts",
  "Captain Hook",
  "Long John Silver",
  "Anne Bonny",
  "Calico Jack",
  "Mad Dog Morgan",
  "Ironbeard",
  "The Sea Serpent",
  "Captain Cutlass",
  "Jolly Roger",
  "Scurvy Sam",
  "Treasure Tom",
  "Davey Jones",
];

const getRandomPirateName = () => PIRATE_NAMES[Math.floor(Math.random() * PIRATE_NAMES.length)];

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createDeck = (): Card[] => {
  const cards: Card[] = [];
  (Object.keys(DECK_COMPOSITION) as CardType[]).forEach((type) => {
    for (let i = 0; i < DECK_COMPOSITION[type]; i++) {
      cards.push({ id: generateId(), type });
    }
  });
  return shuffle(cards);
};

const createTokenStacks = (): Record<GoodsType, Token[]> => {
  const stacks: Record<GoodsType, Token[]> = {} as Record<GoodsType, Token[]>;
  (Object.keys(INITIAL_TOKEN_VALUES) as GoodsType[]).forEach((type) => {
    stacks[type] = INITIAL_TOKEN_VALUES[type].map((value) => ({
      id: generateId(),
      type,
      value,
    }));
  });
  return stacks;
};

const createBonusTokens = () => ({
  three: shuffle(BONUS_THREE_VALUES).map((value) => ({
    id: generateId(),
    cardsCount: 3 as const,
    value,
  })),
  four: shuffle(BONUS_FOUR_VALUES).map((value) => ({
    id: generateId(),
    cardsCount: 4 as const,
    value,
  })),
  five: shuffle(BONUS_FIVE_VALUES).map((value) => ({
    id: generateId(),
    cardsCount: 5 as const,
    value,
  })),
});

// Hidden treasure tokens for Treasure Chest rule
const TREASURE_CHEST_VALUES = [2, 3, 4, 5];

const createHiddenTreasures = (playerIds: string[]): HiddenTreasure[] => {
  const shuffledValues = shuffle(TREASURE_CHEST_VALUES);
  return playerIds.map((playerId, index) => ({
    playerId,
    tokens: [{
      id: generateId(),
      cardsCount: 3 as const,
      value: shuffledValues[index % shuffledValues.length],
    }],
  }));
};

const createPlayer = (id: string, name: string, isAI = false): Player => ({
  id,
  name,
  hand: [],
  ships: [],
  tokens: [],
  bonusTokens: [],
  isAI,
  hasUsedPirateRaid: false,
});

export const calculateScore = (player: Player): number => {
  const tokenScore = player.tokens.reduce((sum, t) => sum + t.value, 0);
  const bonusScore = player.bonusTokens.reduce((sum, t) => sum + t.value, 0);
  const shipBonus = player.ships.length >= 1 ? 5 : 0;
  return tokenScore + bonusScore + shipBonus;
};

const defaultOptionalRules: OptionalRules = {
  stormRule: false,
  pirateRaid: false,
  treasureChest: false,
};

interface GameStore extends GameState {
  // Actions
  startGame: (playerName: string, difficulty: Difficulty, optionalRules?: OptionalRules) => void;
  takeCard: (cardId: string) => void;
  takeAllShips: () => void;
  exchangeCards: (handCardIds: string[], marketCardIds: string[]) => void;
  sellCards: (cardIds: string[]) => void;
  pirateRaid: (targetCardId: string) => void;
  endTurn: () => void;
  nextRound: () => void;
  resetGame: () => void;
  
  // AI
  makeAIMove: () => void;
  
  // Computed
  canTakeCard: (cardId: string) => boolean;
  canSellCards: (cardIds: string[]) => boolean;
  canExchange: (handCardIds: string[], marketCardIds: string[]) => boolean;
  canUsePirateRaid: () => boolean;
  getCurrentPlayer: () => Player;
  getOpponent: () => Player;
  isGameOver: () => boolean;
  isRoundOver: () => boolean;
  getWinner: () => Player | null;
  getRoundWinner: () => Player | null;
  getRevealedTreasures: () => HiddenTreasure[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'lobby',
  market: [],
  deck: [],
  tokenStacks: createTokenStacks(),
  bonusTokens: createBonusTokens(),
  players: [createPlayer('1', 'Player'), createPlayer('2', getRandomPirateName(), true)],
  currentPlayerIndex: 0,
  round: 1,
  maxRounds: 3,
  roundWins: [0, 0],
  lastAction: null,
  difficulty: 'medium',
  optionalRules: defaultOptionalRules,
  turnCount: 0,
  hiddenTreasures: [],

  startGame: (playerName, difficulty, optionalRules = defaultOptionalRules) => {
    const deck = createDeck();
    const market: Card[] = [];
    const players: [Player, Player] = [
      createPlayer('1', playerName),
      createPlayer('2', getRandomPirateName(), true),
    ];

    // Deal initial market (3 ships + 2 from deck)
    let shipCount = 0;
    const remainingDeck: Card[] = [];
    
    for (const card of deck) {
      if (shipCount < 3 && card.type === 'ships') {
        market.push(card);
        shipCount++;
      } else {
        remainingDeck.push(card);
      }
    }
    
    // Add 2 more cards to market
    market.push(...remainingDeck.splice(0, 2));

    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      const card1 = remainingDeck.shift();
      const card2 = remainingDeck.shift();
      if (card1) {
        if (card1.type === 'ships') {
          players[0].ships.push(card1);
        } else {
          players[0].hand.push(card1);
        }
      }
      if (card2) {
        if (card2.type === 'ships') {
          players[1].ships.push(card2);
        } else {
          players[1].hand.push(card2);
        }
      }
    }

    // Create hidden treasures if treasure chest rule is enabled
    const hiddenTreasures = optionalRules.treasureChest 
      ? createHiddenTreasures(players.map(p => p.id))
      : [];

    set({
      phase: 'playing',
      deck: remainingDeck,
      market,
      players,
      tokenStacks: createTokenStacks(),
      bonusTokens: createBonusTokens(),
      currentPlayerIndex: 0,
      round: 1,
      roundWins: [0, 0],
      lastAction: null,
      difficulty,
      optionalRules,
      turnCount: 0,
      hiddenTreasures,
    });
  },

  takeCard: (cardId) => {
    const { market, deck, players, currentPlayerIndex } = get();
    const cardIndex = market.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const card = market[cardIndex];
    const player = players[currentPlayerIndex];

    // Check if it's a ship
    if (card.type === 'ships') {
      player.ships.push(card);
    } else {
      if (player.hand.length >= HAND_LIMIT) return;
      player.hand.push(card);
    }

    // Remove from market and refill
    const newMarket = market.filter((c) => c.id !== cardId);
    if (deck.length > 0) {
      newMarket.push(deck[0]);
    }

    const newPlayers = [...players] as [Player, Player];
    newPlayers[currentPlayerIndex] = { ...player };

    set({
      market: newMarket,
      deck: deck.slice(1),
      players: newPlayers,
      lastAction: `${player.name} took a ${card.type}`,
    });

    get().endTurn();
  },

  takeAllShips: () => {
    const { market, deck, players, currentPlayerIndex } = get();
    const ships = market.filter((c) => c.type === 'ships');
    if (ships.length === 0) return;

    const player = players[currentPlayerIndex];
    player.ships.push(...ships);

    // Remove ships and refill market
    let newMarket = market.filter((c) => c.type !== 'ships');
    const cardsNeeded = MARKET_SIZE - newMarket.length;
    newMarket = [...newMarket, ...deck.slice(0, cardsNeeded)];

    const newPlayers = [...players] as [Player, Player];
    newPlayers[currentPlayerIndex] = { ...player };

    set({
      market: newMarket,
      deck: deck.slice(cardsNeeded),
      players: newPlayers,
      lastAction: `${player.name} took ${ships.length} ships`,
    });

    get().endTurn();
  },

  exchangeCards: (handCardIds, marketCardIds) => {
    const { market, deck, players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];

    // Get cards to exchange (from both hand and ships)
    const handCards = player.hand.filter((c) => handCardIds.includes(c.id));
    const handShips = player.ships.filter((c) => handCardIds.includes(c.id));
    const marketCards = market.filter((c) => marketCardIds.includes(c.id));

    // Validate exchange - total cards from hand + ships must match market cards
    const totalFromHand = handCards.length + handShips.length;
    if (totalFromHand !== marketCards.length) return;
    if (totalFromHand < 2) return;

    // Perform exchange
    const newHand = player.hand.filter((c) => !handCardIds.includes(c.id));
    const newShips = player.ships.filter((c) => !handCardIds.includes(c.id));
    
    marketCards.forEach((card) => {
      if (card.type === 'ships') {
        newShips.push(card);
      } else {
        newHand.push(card);
      }
    });

    const newMarket = [
      ...market.filter((c) => !marketCardIds.includes(c.id)),
      ...handCards,
      ...handShips,
    ];

    const newPlayers = [...players] as [Player, Player];
    newPlayers[currentPlayerIndex] = {
      ...player,
      hand: newHand,
      ships: newShips,
    };

    set({
      market: newMarket,
      players: newPlayers,
      lastAction: `${player.name} exchanged ${marketCards.length} cards`,
    });

    get().endTurn();
  },

  sellCards: (cardIds) => {
    const { players, currentPlayerIndex, tokenStacks, bonusTokens } = get();
    const player = players[currentPlayerIndex];

    const cardsToSell = player.hand.filter((c) => cardIds.includes(c.id));
    if (cardsToSell.length === 0) return;

    // All cards must be same type
    const type = cardsToSell[0].type as GoodsType;
    if (!cardsToSell.every((c) => c.type === type)) return;

    // Check minimum for expensive goods
    const expensive: GoodsType[] = ['gold', 'silver', 'gemstones'];
    if (expensive.includes(type) && cardsToSell.length < MIN_SELL_EXPENSIVE) return;

    // Take tokens
    const tokens = tokenStacks[type].splice(0, cardsToSell.length);
    player.tokens.push(...tokens);

    // Award bonus token
    let bonus: BonusToken | undefined;
    if (cardsToSell.length >= 5 && bonusTokens.five.length > 0) {
      bonus = bonusTokens.five.shift();
    } else if (cardsToSell.length === 4 && bonusTokens.four.length > 0) {
      bonus = bonusTokens.four.shift();
    } else if (cardsToSell.length === 3 && bonusTokens.three.length > 0) {
      bonus = bonusTokens.three.shift();
    }
    if (bonus) player.bonusTokens.push(bonus);

    // Remove cards from hand
    const newHand = player.hand.filter((c) => !cardIds.includes(c.id));

    const newPlayers = [...players] as [Player, Player];
    newPlayers[currentPlayerIndex] = { ...player, hand: newHand };

    set({
      players: newPlayers,
      tokenStacks: { ...tokenStacks },
      bonusTokens: { ...bonusTokens },
      lastAction: `${player.name} sold ${cardsToSell.length} ${type}`,
    });

    get().endTurn();
  },

  pirateRaid: (targetCardId) => {
    const { players, currentPlayerIndex, optionalRules } = get();
    if (!optionalRules.pirateRaid) return;

    const player = players[currentPlayerIndex];
    if (player.hasUsedPirateRaid) return;
    if (player.hand.length >= HAND_LIMIT) return;

    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
    const opponent = players[opponentIndex];

    const cardIndex = opponent.hand.findIndex((c) => c.id === targetCardId);
    if (cardIndex === -1) return;

    const stolenCard = opponent.hand[cardIndex];
    
    // Remove from opponent and add to player
    const newOpponentHand = opponent.hand.filter((c) => c.id !== targetCardId);
    const newPlayerHand = [...player.hand, stolenCard];

    const newPlayers = [...players] as [Player, Player];
    newPlayers[currentPlayerIndex] = { 
      ...player, 
      hand: newPlayerHand,
      hasUsedPirateRaid: true,
    };
    newPlayers[opponentIndex] = { ...opponent, hand: newOpponentHand };

    set({
      players: newPlayers,
      lastAction: `${player.name} raided ${opponent.name}'s ${stolenCard.type}!`,
    });

    get().endTurn();
  },

  endTurn: () => {
    const { currentPlayerIndex, players, optionalRules, turnCount, market, deck } = get();
    
    // Increment turn count
    const newTurnCount = turnCount + 1;

    // Check for round end
    if (get().isRoundOver()) {
      // If treasure chest rule is active, reveal and add hidden treasures
      if (optionalRules.treasureChest) {
        const { hiddenTreasures } = get();
        const updatedPlayers = [...players] as [Player, Player];
        
        hiddenTreasures.forEach((treasure) => {
          const playerIndex = updatedPlayers.findIndex(p => p.id === treasure.playerId);
          if (playerIndex !== -1) {
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              bonusTokens: [...updatedPlayers[playerIndex].bonusTokens, ...treasure.tokens],
            };
          }
        });
        
        set({ players: updatedPlayers });
      }

      const winner = get().getRoundWinner();
      const roundWins = [...get().roundWins] as [number, number];
      if (winner) {
        const winnerIndex = players.findIndex((p) => p.id === winner.id);
        roundWins[winnerIndex]++;
      }
      set({ phase: 'roundEnd', roundWins, turnCount: newTurnCount });
      return;
    }

    // Apply Storm Rule - every 3rd turn, discard 2 random market cards
    let newMarket = [...market];
    let newDeck = [...deck];
    let stormMessage = '';
    
    if (optionalRules.stormRule && newTurnCount % 3 === 0 && newMarket.length >= 2) {
      // Remove 2 random non-ship cards from market
      const nonShipCards = newMarket.filter(c => c.type !== 'ships');
      const cardsToRemove = shuffle(nonShipCards).slice(0, Math.min(2, nonShipCards.length));
      
      newMarket = newMarket.filter(c => !cardsToRemove.some(r => r.id === c.id));
      
      // Refill market from deck
      const cardsNeeded = MARKET_SIZE - newMarket.length;
      newMarket = [...newMarket, ...newDeck.slice(0, cardsNeeded)];
      newDeck = newDeck.slice(cardsNeeded);
      
      stormMessage = ` ⛈️ Storm washes away ${cardsToRemove.length} cards!`;
    }

    const nextIndex = currentPlayerIndex === 0 ? 1 : 0;
    
    set({ 
      currentPlayerIndex: nextIndex, 
      turnCount: newTurnCount,
      market: newMarket,
      deck: newDeck,
      lastAction: get().lastAction + stormMessage,
    });

    // If next player is AI, trigger AI move
    if (players[nextIndex].isAI) {
      setTimeout(() => get().makeAIMove(), 1000);
    }
  },

  nextRound: () => {
    const { round, maxRounds, roundWins, optionalRules } = get();
    
    // Check if game is over
    if (round >= maxRounds || roundWins[0] >= 2 || roundWins[1] >= 2) {
      set({ phase: 'gameEnd' });
      return;
    }

    // Start new round
    const deck = createDeck();
    const market: Card[] = [];
    const players = get().players.map((p) => ({
      ...p,
      hand: [],
      ships: [],
      tokens: [],
      bonusTokens: [],
      hasUsedPirateRaid: false, // Reset pirate raid for new round
    })) as [Player, Player];

    // Deal initial market
    let shipCount = 0;
    const remainingDeck: Card[] = [];
    
    for (const card of deck) {
      if (shipCount < 3 && card.type === 'ships') {
        market.push(card);
        shipCount++;
      } else {
        remainingDeck.push(card);
      }
    }
    market.push(...remainingDeck.splice(0, 2));

    // Deal cards
    for (let i = 0; i < 5; i++) {
      const card1 = remainingDeck.shift();
      const card2 = remainingDeck.shift();
      if (card1) {
        if (card1.type === 'ships') players[0].ships.push(card1);
        else players[0].hand.push(card1);
      }
      if (card2) {
        if (card2.type === 'ships') players[1].ships.push(card2);
        else players[1].hand.push(card2);
      }
    }

    // Create new hidden treasures for this round
    const hiddenTreasures = optionalRules.treasureChest 
      ? createHiddenTreasures(players.map(p => p.id))
      : [];

    set({
      phase: 'playing',
      deck: remainingDeck,
      market,
      players,
      tokenStacks: createTokenStacks(),
      bonusTokens: createBonusTokens(),
      currentPlayerIndex: 0,
      round: round + 1,
      lastAction: null,
      turnCount: 0,
      hiddenTreasures,
    });
  },

  resetGame: () => {
    set({
      phase: 'lobby',
      market: [],
      deck: [],
      tokenStacks: createTokenStacks(),
      bonusTokens: createBonusTokens(),
      players: [createPlayer('1', 'Player'), createPlayer('2', 'Pirate AI', true)],
      currentPlayerIndex: 0,
      round: 1,
      roundWins: [0, 0],
      lastAction: null,
      optionalRules: defaultOptionalRules,
      turnCount: 0,
      hiddenTreasures: [],
    });
  },

  makeAIMove: () => {
    const { market, players, currentPlayerIndex, tokenStacks, difficulty, optionalRules } = get();
    const ai = players[currentPlayerIndex];
    if (!ai.isAI) return;

    // AI decision making
    const actions: { action: () => void; score: number }[] = [];

    // Evaluate pirate raid (if available and has good targets)
    if (optionalRules.pirateRaid && !ai.hasUsedPirateRaid && ai.hand.length < HAND_LIMIT) {
      const opponent = players[currentPlayerIndex === 0 ? 1 : 0];
      const valuableTypes: GoodsType[] = ['gemstones', 'gold', 'silver'];
      
      opponent.hand.forEach((card) => {
        if (valuableTypes.includes(card.type as GoodsType)) {
          const stack = tokenStacks[card.type as GoodsType];
          let score = stack.length > 0 ? stack[0].value + 3 : 5; // High priority for valuable cards
          actions.push({ action: () => get().pirateRaid(card.id), score });
        }
      });
    }

    // Evaluate taking each card
    market.forEach((card) => {
      if (card.type !== 'ships' && ai.hand.length < HAND_LIMIT) {
        let score = 0;
        const type = card.type as GoodsType;
        const stack = tokenStacks[type];
        if (stack.length > 0) {
          score = stack[0].value;
          // Count existing cards of this type
          const existing = ai.hand.filter((c) => c.type === type).length;
          score += existing * 2; // Bonus for collecting sets
        }
        actions.push({ action: () => get().takeCard(card.id), score });
      }
    });

    // Evaluate taking all ships
    const ships = market.filter((c) => c.type === 'ships');
    if (ships.length > 0) {
      actions.push({
        action: () => get().takeAllShips(),
        score: ships.length * 1.5,
      });
    }

    // Evaluate selling
    const cardsByType: Record<string, Card[]> = {};
    ai.hand.forEach((card) => {
      if (!cardsByType[card.type]) cardsByType[card.type] = [];
      cardsByType[card.type].push(card);
    });

    Object.entries(cardsByType).forEach(([type, cards]) => {
      const expensive = ['gold', 'silver', 'gemstones'];
      const minCards = expensive.includes(type) ? 2 : 1;
      
      if (cards.length >= minCards) {
        const stack = tokenStacks[type as GoodsType];
        let score = 0;
        for (let i = 0; i < Math.min(cards.length, stack.length); i++) {
          score += stack[i].value;
        }
        // Bonus for larger sales
        if (cards.length >= 5) score += 10;
        else if (cards.length >= 4) score += 6;
        else if (cards.length >= 3) score += 3;
        
        actions.push({
          action: () => get().sellCards(cards.map((c) => c.id)),
          score,
        });
      }
    });

    // Sort by score and add randomness based on difficulty
    actions.sort((a, b) => b.score - a.score);

    let chosenIndex = 0;
    if (difficulty === 'easy') {
      chosenIndex = Math.floor(Math.random() * Math.min(3, actions.length));
    } else if (difficulty === 'medium') {
      chosenIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * Math.min(2, actions.length));
    }
    // hard: always pick best

    if (actions.length > 0) {
      actions[chosenIndex].action();
    }
  },

  canTakeCard: (cardId) => {
    const { market, players, currentPlayerIndex } = get();
    const card = market.find((c) => c.id === cardId);
    if (!card) return false;
    
    const player = players[currentPlayerIndex];
    if (card.type === 'ships') return true;
    return player.hand.length < HAND_LIMIT;
  },

  canSellCards: (cardIds) => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    
    const cards = player.hand.filter((c) => cardIds.includes(c.id));
    if (cards.length === 0) return false;
    
    const type = cards[0].type;
    if (!cards.every((c) => c.type === type)) return false;
    
    const expensive = ['gold', 'silver', 'gemstones'];
    if (expensive.includes(type) && cards.length < MIN_SELL_EXPENSIVE) return false;
    
    return true;
  },

  canExchange: (handCardIds, marketCardIds) => {
    if (handCardIds.length < 2 || marketCardIds.length < 2) return false;
    if (handCardIds.length !== marketCardIds.length) return false;
    return true;
  },

  canUsePirateRaid: () => {
    const { players, currentPlayerIndex, optionalRules } = get();
    if (!optionalRules.pirateRaid) return false;
    
    const player = players[currentPlayerIndex];
    if (player.hasUsedPirateRaid) return false;
    if (player.hand.length >= HAND_LIMIT) return false;
    
    const opponent = players[currentPlayerIndex === 0 ? 1 : 0];
    return opponent.hand.length > 0;
  },

  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex];
  },

  getOpponent: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex === 0 ? 1 : 0];
  },

  isGameOver: () => {
    const { roundWins, round, maxRounds } = get();
    return roundWins[0] >= 2 || roundWins[1] >= 2 || round > maxRounds;
  },

  isRoundOver: () => {
    const { deck, tokenStacks, market } = get();
    
    // Deck empty
    if (deck.length === 0 && market.length < MARKET_SIZE) return true;
    
    // 3 token stacks empty
    const emptyStacks = Object.values(tokenStacks).filter((s) => s.length === 0).length;
    return emptyStacks >= 3;
  },

  getWinner: () => {
    const { players, roundWins } = get();
    if (roundWins[0] >= 2) return players[0];
    if (roundWins[1] >= 2) return players[1];
    if (roundWins[0] > roundWins[1]) return players[0];
    if (roundWins[1] > roundWins[0]) return players[1];
    return null;
  },

  getRoundWinner: () => {
    const { players } = get();
    const score0 = calculateScore(players[0]);
    const score1 = calculateScore(players[1]);
    
    if (score0 > score1) return players[0];
    if (score1 > score0) return players[1];
    
    // Tie breaker: most bonus tokens
    if (players[0].bonusTokens.length > players[1].bonusTokens.length) return players[0];
    if (players[1].bonusTokens.length > players[0].bonusTokens.length) return players[1];
    
    // Tie breaker: most goods tokens
    if (players[0].tokens.length > players[1].tokens.length) return players[0];
    if (players[1].tokens.length > players[0].tokens.length) return players[1];
    
    return null;
  },

  getRevealedTreasures: () => {
    const { hiddenTreasures, phase, optionalRules } = get();
    if (!optionalRules.treasureChest) return [];
    if (phase !== 'roundEnd' && phase !== 'gameEnd') return [];
    return hiddenTreasures;
  },
}));
