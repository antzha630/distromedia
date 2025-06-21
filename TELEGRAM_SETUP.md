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

3. **Set Bot Domain (IMPORTANT)**
   - In Telegram, message `@BotFather` again
   - Send `/setdomain`
   - Select your bot (distromedia_bot)
   - Set the domain to your Vercel URL (e.g., `your-app.vercel.app`)
   - Make sure to use the exact domain without `https://` or trailing slashes

4. **Verify Bot Configuration**
   - Deploy your app to Vercel
   - Visit your app and check if the Telegram widget appears
   - If it doesn't appear, use the "Reload Widget" button

## How It Works

The Telegram Login Widget works by:
1. User clicks the "Login with Telegram" button
2. Telegram opens a popup for authentication
3. User authorizes the bot
4. Telegram sends user data back to your app
5. User is redirected to the scheduler

## Troubleshooting

### Widget Doesn't Appear
- **Check domain configuration**: Make sure you set the domain correctly in BotFather
- **Verify bot token**: Ensure `TELEGRAM_BOT_TOKEN` is set in Vercel environment variables
- **Check browser console**: Look for any JavaScript errors
- **Try reloading**: Use the "Reload Widget" button if available
- **Clear browser cache**: Sometimes cached scripts can cause issues

### "Invalid Authentication Data"
- **Domain mismatch**: The domain in BotFather must exactly match your Vercel URL
- **Bot token incorrect**: Double-check the token from BotFather
- **HTTPS required**: Make sure you're using HTTPS (Vercel provides this automatically)

### "Authentication Data Too Old"
- **Try again**: This usually resolves itself on retry
- **Check system clock**: Ensure your device clock is accurate
- **Clear browser data**: Clear cookies and cache

### Widget Loads But Login Fails
- **Check bot permissions**: Make sure your bot is active and not blocked
- **Verify callback URL**: The widget should redirect back to your app
- **Check server logs**: Look at Vercel function logs for any errors

## Common Issues with Vercel

1. **Domain Configuration**: 
   - Use your exact Vercel domain (e.g., `myapp.vercel.app`)
   - Don't include `https://` or `www.`
   - Don't include trailing slashes

2. **Environment Variables**:
   - Make sure to redeploy after adding environment variables
   - Check that the variable name is exactly `TELEGRAM_BOT_TOKEN`

3. **Widget Loading**:
   - The widget script loads from Telegram's CDN
   - Sometimes it can be slow or fail to load
   - The "Reload Widget" button helps with this

## Testing

1. **Deploy to Vercel**: Make sure your app is deployed
2. **Set domain in BotFather**: Use your Vercel domain
3. **Visit your app**: Check if the widget appears
4. **Test login**: Try logging in with a Telegram account
5. **Check redirect**: Verify you're redirected to the scheduler

## Bot Token Security

- **Keep it secret**: Never commit your bot token to Git
- **Use environment variables**: Always use Vercel's environment variables
- **Rotate if needed**: You can regenerate your bot token in BotFather if compromised

## Support

If you're still having issues:
1. Check the browser console for errors
2. Verify your domain is set correctly in BotFather
3. Ensure all environment variables are set in Vercel
4. Try creating a new bot if the current one has issues
5. Check Vercel function logs for server-side errors 