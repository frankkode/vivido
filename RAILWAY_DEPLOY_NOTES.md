# Railway Deployment - AI Chess Game

## What's New
- ✅ AI opponents with 4 difficulty levels
- ✅ Short 5-character game IDs (e.g., K7M3P)
- ✅ Professional game over modal
- ✅ Drag-and-drop piece movement
- ✅ PWA installation fixed

## Testing AI Game
1. Enter your name
2. Click "🤖 Play vs AI"
3. Select difficulty (Beginner/Intermediate/Advanced/Expert)
4. Click "Start Game"
5. AI will respond after your moves (or play first if AI is white)

## Expected Behavior
- Game ID should be 5 characters (not long UUID)
- AI responds within 5 seconds
- Shows "AI is thinking..." when AI's turn

## Troubleshooting
If "Start Game" button doesn't work:
- Check browser console for errors
- Verify WebSocket connection (should see "Connected to server")
- Hard refresh browser (Ctrl+Shift+R)
