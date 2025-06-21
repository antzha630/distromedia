# Telegram Setup Guide (Core API Method)

This guide explains how to set up the new, more reliable Telegram login system that uses the Telegram Core API. This method bypasses the buggy Login Widget.

## Setup Overview
You will need to get three credentials:
1.  **API ID:** Your personal developer ID.
2.  **API Hash:** Your personal developer secret hash.
3.  **Bot Token:** The token for your bot (e.g., `distroappv2_bot`) which will be used for posting content later.

## Step 1: Get Your Telegram API Credentials

1.  Go to the official Telegram applications page: **[my.telegram.org](https://my.telegram.org)**
2.  Log in with the phone number you use for Telegram.
3.  Click on **"API development tools"**.
4.  You will see an "App configuration" form. You only need to fill out two fields:
    *   **App title:** `DistroMedia App` (or any name you like)
    *   **Short name:** `distromedia` (or any short name)
5.  Click **"Create application"**.
6.  You will now see your credentials. **Copy the `api_id` and `api_hash`**. Keep this page open.

## Step 2: Get Your Bot Token

1.  In your Telegram app, message `@BotFather`.
2.  Send `/mybots` and select your bot (e.g., `distroappv2_bot`).
3.  Click **"API Token"** and copy the token.

## Step 3: Configure Environment Variables in Vercel

1.  Go to your project's settings in the Vercel dashboard.
2.  Navigate to **"Environment Variables"**.
3.  Add the following three variables:
    *   `TELEGRAM_API_ID`: The `api_id` you copied from my.telegram.org.
    *   `TELEGRAM_API_HASH`: The `api_hash` you copied from my.telegram.org.
    *   `TELEGRAM_BOT_TOKEN`: The bot token you copied from BotFather.
4.  Save the variables.

## Step 4: Redeploy Your Application

1.  In Vercel, go to the **"Deployments"** tab.
2.  Find the latest deployment at the top of the list.
3.  Click the `...` menu on the right and select **"Redeploy"**.
4.  Wait for the new deployment to finish.

## How the New Login Works

1.  Your application now shows a field to enter a phone number.
2.  When you enter your number, your server uses your `API_ID` and `API_HASH` to ask Telegram to send a 5-digit code directly to your Telegram app.
3.  You enter that code into the app.
4.  Your server verifies the code, logs you in, and creates a secure session.

This method is much more stable and is not affected by the Login Widget bugs.

## Troubleshooting

*   **"Telegram API credentials are not configured..."**: Make sure you have correctly set `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` in Vercel and redeployed.
*   **"The phone number is invalid..."**: You must enter your full phone number in international format, including the `+` and your country code (e.g., `+15551234567`).
*   **"You are trying too often..."**: Telegram has rate limits. Please wait a few minutes before requesting another code.
*   **"Two-Step Verification enabled..."**: For this login method to work, you must temporarily disable Two-Step Verification (also known as a cloud password) on your Telegram account. You can do this in `Telegram Settings > Privacy and Security > Two-Step Verification`. You can re-enable it after logging in.
*   **Code not received**: Ensure you are checking the Telegram app on your phone or desktop, not your SMS messages. Check the "Telegram" service notifications chat.

That's it! Your login system should now be working perfectly. 