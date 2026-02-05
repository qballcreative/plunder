
# Plan: Move Optional Rules to Settings Panel

## Overview
Relocate the optional game rules from the landing page's game setup card into the Settings panel, creating a dedicated "Game Rules" section. This will make the landing page cleaner and provide a scalable structure for adding future rules (especially multiplayer variants).

## Architecture Changes

### Store Changes
Move optional rules state from `playerStore` to `settingsStore`:
- Transfer `lastOptionalRules` and `setLastOptionalRules` to `settingsStore`
- This consolidates all game preferences in one store
- Keep the persisted storage so rules are remembered

### Settings Panel Updates
Add a new "Game Rules" section with:
- Section header with a Scroll/Book icon
- Toggle buttons for each optional rule (Storm, Pirate Raid, Treasure Chest)
- Same visual styling as landing page (colored borders, icons, descriptions)
- Expandable structure to later add "2-Player Rules" vs "3+ Player Rules" subsections

### Landing Page Cleanup
- Remove the "Optional Rules" section from the game setup card
- Keep difficulty selection on landing page (quick per-game choice)
- Update imports to pull optional rules from `settingsStore` instead of `playerStore`

### Multiplayer Lobby Updates
- Update to read optional rules from `settingsStore` instead of receiving them as props
- Simplify props interface

## Technical Details

### File: `src/store/settingsStore.ts`
Add optional rules state:
- Add `OptionalRules` import from types
- Add `optionalRules` state with default values
- Add `setOptionalRule(key, value)` action for toggling individual rules
- Add `setOptionalRules(rules)` action for bulk updates

### File: `src/store/playerStore.ts`
Remove optional rules:
- Remove `lastOptionalRules` state
- Remove `setLastOptionalRules` action
- Update `resetAll` to not include optional rules

### File: `src/components/game/SettingsPanel.tsx`
Add Game Rules section:
- Import optional rules config (icons, labels, descriptions, colors)
- Add collapsible "Game Rules" section after audio settings
- Render toggle buttons for each rule with Switch components
- Use consistent styling with existing settings sections

### File: `src/components/game/LandingPage.tsx`
Simplify game setup:
- Remove optional rules UI section (lines 231-250)
- Remove `optionalRulesConfig` definition
- Update imports to use `useSettingsStore` for optional rules
- Pass rules from settings store to `startGame` and `MultiplayerLobby`

### File: `src/components/game/MultiplayerLobby.tsx`
Update props:
- Remove `optionalRules` from props interface
- Import and use `useSettingsStore` to access optional rules directly

## Visual Layout

The Settings panel will be organized as:

```text
+---------------------------+
| Settings                  |
+---------------------------+
| Sound Effects        [on] |
|   Volume: ========        |
+---------------------------+
| Background Music    [off] |
+---------------------------+
| Notification Duration     |
|   3 seconds: ========     |
+---------------------------+
| Game Rules                |
+---------------------------+
| Storm Rule          [off] |
|   Every 3rd turn...       |
+---------------------------+
| Pirate Raid         [off] |
|   Steal one card...       |
+---------------------------+
| Treasure Chest      [off] |
|   Hidden bonus...         |
+---------------------------+
```

## Benefits
1. Landing page becomes cleaner and more focused
2. All settings/preferences in one location
3. Easy to add future rule categories (e.g., "3+ Player Rules")
4. Rules persist across sessions without cluttering the main UI
5. Users can quickly adjust settings mid-session via the gear icon
