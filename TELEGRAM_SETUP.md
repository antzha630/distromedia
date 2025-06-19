# Telegram Bot Setup Guide

## Quick Setup

1. **Create a Telegram Bot**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot`
   - Follow the instructions to create your bot
   - Save the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Configure Environment Variables**
   - In your Vercel dashboard, go to your project settings
   - Navigate to Environment Variables
   - Add `TELEGRAM_BOT_TOKEN` with your bot token
   - Redeploy your application

3. **Set Bot Domain**
   - In Telegram, message `@BotFather` again
   - Send `/setdomain`
   - Select your bot
   - Set the domain to your Vercel URL (e.g., `your-app.vercel.app`)

## Troubleshooting

### Widget Doesn't Appear
- Click "Verify Bot" button to check configuration
- Check browser console for errors
- Make sure your domain is set correctly in BotFather

### Login Fails
- Verify bot token is correct in environment variables
- Check that domain is set in BotFather
- Ensure you're using HTTPS (required for Telegram login)

### "Invalid Authentication Data"
- Bot token might be incorrect
- Domain configuration issue
- Try recreating the bot

### "Authentication Data Too Old"
- Try logging in again
- Check your system clock

## Testing

Use the "Test Bot" button to verify your bot configuration is working correctly.

## Common Issues

1. **Bot token not working**: Double-check the token from BotFather
2. **Domain not set**: Use `/setdomain` in BotFather
3. **HTTPS required**: Telegram login only works over HTTPS
4. **Widget not loading**: Check browser console and network tab

## Support

If you're still having issues:
1. Check the browser console for errors
2. Use the "Verify Bot" button for detailed diagnostics
3. Ensure all environment variables are set correctly
4. Try creating a new bot if the current one has issues 