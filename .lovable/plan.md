
# Plan: Fix Multiplayer Reconnection Flow

## Problem Summary
When a player disconnects and rejoins using the game code, the connection is re-established but:
- The rejoining player stays stuck on "Waiting for host to start..." screen
- The host can continue playing but the rejoining player never receives the current game state
- There's no mechanism to resume an in-progress game after reconnection

## Root Cause
The `MultiplayerLobby` component only listens for a `'start'` message (used for initial game start). When a player reconnects mid-game:
1. The host's connection handler accepts the new connection
2. But the host doesn't know a game is already in progress and doesn't send the game state
3. The guest's lobby has no way to receive and apply an existing game state

## Solution Overview

```text
+------------------+     reconnects     +------------------+
|  Rejoining       | -----------------> |      Host        |
|  Player          |                    |   (game active)  |
+------------------+                    +------------------+
        |                                       |
        |  <------ 'rejoin-sync' message -------|
        |         (contains full game state)    |
        |                                       |
        v                                       |
 applyGameState()                               |
 + set phase='playing'                          |
        |                                       |
        v                                       |
  [GameBoard renders]              [Game continues]
```

## Implementation Steps

### 1. Add a new message type for reconnection sync
Update the `GameMessage` type in `multiplayerStore.ts` to include `'rejoin-sync'` for clarity (or reuse `'game-state'`).

### 2. Detect active game on host when new connection arrives
Modify `multiplayerStore.ts` - in the `setupConnectionHandlers` function within `hostGame`:
- After accepting a new connection, check if a game is in progress (we need access to game state)
- Send the current game state to the reconnecting player

Since the multiplayer store doesn't have direct access to the game store, we'll need to:
- Add a callback mechanism or use a direct import
- Or trigger a custom event that GameBoard can listen to

### 3. Add reconnection detection and game state broadcast in GameBoard
Modify `GameBoard.tsx`:
- Add an effect that watches for `multiplayerState` transitioning to `'connected'` when `isHost` is true and `phase === 'playing'`
- When this happens, broadcast the current game state to the reconnected player with a `'rejoin-sync'` message

### 4. Update MultiplayerLobby to handle rejoin sync
Modify `MultiplayerLobby.tsx`:
- Listen for `'rejoin-sync'` (or `'game-state'`) message in addition to `'start'`
- When received, call `applyGameState` just like for the initial start
- This will set `phase: 'playing'` and cause the Index component to render GameBoard

### 5. Handle edge case: Guest reconnecting to host who is still on GameBoard
The host's GameBoard component needs to detect when a new connection is established and send the sync message.

---

## Technical Details

### Changes to `src/store/multiplayerStore.ts`
- Update `GameMessage.type` union to include `'rejoin-sync'`
- (Optional) Add a `gameInProgress` flag or callback mechanism

### Changes to `src/components/game/MultiplayerLobby.tsx`
- Extend the message listener to handle both `'start'` and `'rejoin-sync'` messages
- Apply game state and transition to playing phase for either message type

### Changes to `src/components/game/GameBoard.tsx`
- Add a new `useEffect` that:
  - Watches `multiplayerState` for transitions to `'connected'`
  - If `isHost`, `isMultiplayer`, and `phase === 'playing'`, sends the current game state
  - Uses a ref to track previous connection state to detect reconnection

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/store/multiplayerStore.ts` | Add `'rejoin-sync'` to message types |
| `src/components/game/MultiplayerLobby.tsx` | Handle `'rejoin-sync'` message to resume game |
| `src/components/game/GameBoard.tsx` | Detect reconnection and broadcast game state to rejoining player |

---

## Expected Behavior After Fix
1. Host creates game, guest joins, game starts normally
2. Guest disconnects (closes tab, network issue, etc.)
3. Host sees "Connection Lost" modal, waits for reconnect
4. Guest returns and enters the same game code
5. Connection re-establishes
6. Host detects reconnection and sends current game state
7. Guest receives game state, lobby applies it (setting `phase: 'playing'`)
8. Both players see the GameBoard with the current game state
9. Play continues from where it left off
