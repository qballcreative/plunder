
# Plan: Enhanced AI Opponent

## Overview
The current AI opponent needs significant improvements to provide a challenging experience on hard difficulty. The AI currently has a simplistic scoring system that doesn't account for key strategic elements of the game.

## Current Weaknesses Identified

| Weakness | Impact |
|----------|--------|
| No exchange actions | AI misses opportunities to acquire multiple valuable cards at once |
| No blocking awareness | AI doesn't prevent player from completing valuable sets |
| Poor sell timing | AI sells too early, getting lower tokens when waiting could yield bonus tokens |
| No token scarcity awareness | AI doesn't race for high-value tokens before they run out |
| Difficulty only adds randomness | Hard mode uses same weak evaluation, just picks the "best" bad option |

## Proposed AI Improvements

### 1. Strategic Evaluation System
Add multiple scoring factors with configurable weights by difficulty:

- **Token Urgency Score**: Prioritize goods where high-value tokens are about to run out
- **Set Completion Bonus**: Massive bonus when close to 4-5 card bonuses
- **Opponent Blocking Score**: Detect what opponent is collecting and deprive them
- **Sell Timing Intelligence**: Wait for 3+ cards unless tokens are running out
- **Exchange Evaluation**: Calculate net value gain from exchange opportunities

### 2. Difficulty-Based Strategy Weights

| Factor | Easy | Medium | Hard |
|--------|------|--------|------|
| Blocking opponent | 0% | 30% | 80% |
| Bonus token pursuit | Low | Medium | Aggressive |
| Sell timing | Impatient | Moderate | Optimal |
| Look-ahead depth | None | 1 turn | 2 turns |
| Random variance | High | Medium | Low |

### 3. New Capabilities

**Exchange Action Support**
- Evaluate market cards the AI needs
- Consider trading ships + low-value cards for high-value targets
- Calculate net score improvement from exchange

**Opponent Awareness (Medium/Hard)**
- Track what cards opponent is collecting
- Prioritize taking cards that block opponent's sets
- Steal high-value targets using Pirate Raid more strategically

**Optimal Sell Timing (Hard)**
- Calculate expected value of waiting vs selling now
- Factor in token depletion rate
- Pursue 4-5 card bonuses aggressively

**Token Race Detection (Hard)**
- Identify when valuable token stacks are nearly depleted
- Rush to sell before tokens run out
- Block opponent from getting last high-value tokens

## Technical Implementation

### File Changes

**`src/store/gameStore.ts`**

1. **Add helper functions for AI analysis:**
   - `getOpponentProgress()`: Analyze what the opponent is collecting
   - `evaluateTokenUrgency()`: Score based on remaining high-value tokens
   - `evaluateExchangeValue()`: Calculate net gain from potential exchanges
   - `evaluateSellTiming()`: Determine optimal time to sell

2. **Rewrite `makeAIMove()` function:**
   - Add exchange evaluation logic
   - Implement difficulty-based weight system
   - Add look-ahead for Hard difficulty
   - Reduce randomness on Hard difficulty to ~10%

3. **Add strategic scoring factors:**
   - Blocking score when opponent has 2+ of a type
   - Bonus pursuit score when AI has 3-4 of a type
   - Urgency score based on token stack size

### Pseudocode for Enhanced Scoring

```text
For each potential action:
  baseScore = immediate token value gained
  
  if SELL action:
    bonusScore = bonus token value (3/4/5 cards)
    urgencyScore = if stack depleting, increase priority
    timingPenalty = if selling 1-2 cards when could wait for 3+, reduce score
  
  if TAKE action:
    setProgress = count of matching cards in hand
    bonusProximity = high score if would reach 3/4/5 cards
    opponentBlock = if opponent has 2+ of this type, add blocking bonus
    
  if EXCHANGE action:
    netGain = sum(value of cards gained) - sum(value of cards given)
    bonusOpportunity = does exchange enable a 4-5 card sale?
    
  if RAID action (hard mode):
    targetValue = pick opponent's most threatening card
    
  totalScore = baseScore * weights[difficulty]
             + blocking * blockingWeight[difficulty]
             + bonusOpportunity * bonusWeight[difficulty]
```

## Expected Results

| Difficulty | Win Rate (current) | Win Rate (after) |
|------------|-------------------|------------------|
| Easy | ~30% | ~25-35% |
| Medium | ~40% | ~45-55% |
| Hard | ~50% | ~65-75% |

## Summary of Changes

| File | Change |
|------|--------|
| `src/store/gameStore.ts` | Complete rewrite of `makeAIMove()` with strategic evaluation, exchange support, opponent tracking, and difficulty-based weights |

This enhancement will make Hard difficulty a genuine challenge by giving the AI strategic awareness comparable to an experienced player.
