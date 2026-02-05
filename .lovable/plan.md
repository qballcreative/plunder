
# Plan: Fix Action Notification Centering on Mobile

## Problem
The action notification popup that shows when other players take actions is offset and extends past the right edge of the screen on mobile devices. It's not properly centered.

## Root Cause
The current styling uses `left-1/2 -translate-x-1/2` for centering, but the inner container has fixed `min-w-[280px] max-w-[400px]` which can exceed viewport width on small screens. Additionally, there's no horizontal padding to prevent the notification from touching screen edges.

## Solution
Update the positioning and sizing in `ActionNotification.tsx` to:
1. Use a wrapper with proper horizontal margins/padding
2. Constrain the width to not exceed screen bounds
3. Ensure proper centering with `inset-x-0` and flexbox

## Technical Changes

**File: `src/components/game/ActionNotification.tsx`**

Change line 72 positioning from:
```tsx
className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
```

To:
```tsx
className="fixed top-20 inset-x-0 z-50 pointer-events-none flex justify-center px-4"
```

And update line 76 inner container max-width:
```tsx
'min-w-[280px] max-w-[400px]'
```

To:
```tsx
'min-w-0 max-w-[400px] w-full sm:w-auto sm:min-w-[280px]'
```

This ensures:
- `inset-x-0` spans the full viewport width
- `flex justify-center` properly centers the content
- `px-4` adds horizontal padding to prevent edge overflow
- `w-full sm:w-auto` makes content responsive on small screens
- `min-w-0` removes the minimum width constraint on mobile
