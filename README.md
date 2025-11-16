
# AI Flappy Game

A modern, AI-powered twist on the classic "Flappy Bird" game. This project demonstrates the power of generative AI by allowing players to create unique game themes—including the character, obstacles, and background—simply by describing them in text.

Built with **React**, **TypeScript**, and the **Google Gemini API**, this application is a fully functional, high-performance Progressive Web App (PWA) designed for a seamless mobile-first experience.

## Table of Contents
- [What is this App?](#what-is-this-app)
- [Core Features](#core-features)
- [From Web App to Play Store App](#from-web-app-to-play-store-app)
- [Monetization & Cost Management Strategy](#monetization--cost-management-strategy)
  - [Monetizing the App](#monetizing-the-app)
  - [Making AI Generation Economically Feasible](#making-ai-generation-economically-feasible)

## What is this App?

AI Flappy Game reimagines a classic mobile game by putting creative control in the hands of the player. Instead of a single, static theme, players can generate endless visual styles using the Gemini AI. Want to play as a "cyberpunk corgi flying through a neon-lit Tokyo"? Just type it in, and the game's assets are generated on the fly.

This project serves as a showcase for building dynamic, user-driven content with modern web technologies and powerful generative AI models, with a strong focus on performance and user experience.

## Core Features

- **AI-Powered Theme Generation**: The core of the app. Users provide a text prompt, and the Gemini API generates a complete theme, including a character sprite, a scrolling background, and a vertically-tileable texture for the pipe obstacles.
- **High-Performance Canvas Rendering**: To ensure a smooth framerate, the game avoids slow DOM manipulation for animations. It leverages the HTML5 Canvas API to efficiently draw the character, all pipes, and visual effects, managed by a central game loop.
- **GPU-Accelerated Motion**: Uses CSS `transform` properties for background scrolling and character positioning, offloading animation work to the GPU for a jank-free experience on all devices.
- **Client-Side Image Processing**: Features a robust, on-the-fly chroma keying process that removes the background from the AI-generated character sprite directly in the browser, demonstrating advanced image manipulation techniques.
- **Classic Mode**: A pre-built, offline-ready theme is included so users can play instantly without using the AI.
- **Dynamic Gameplay**: The game's difficulty scales exponentially, increasing pipe speed and shrinking the pipe gap every 5 points for a challenging experience.
- **Progressive Web App (PWA)**: Fully installable on mobile devices, with offline capabilities thanks to a Service Worker. All core game logic and the "Classic Mode" are available offline after the first visit.
- **Play History**: The app locally saves your prompts, number of tries, and high scores for each theme.

## From Web App to Play Store App

This application is a PWA, which can be easily packaged and listed on the Google Play Store using a technology called a **Trusted Web Activity (TWA)**. A TWA allows you to display your web content in a fullscreen browser window within an Android app, providing a native-like experience.

Here’s the step-by-step process:

### Prerequisites:

1.  **Deploy the App**: Your PWA must be hosted on a live, secure (HTTPS) server.
2.  **Google Play Developer Account**: You'll need an account to publish apps ($25 one-time fee).
3.  **Android Studio**: The official IDE for Android development. While you won't be writing Java/Kotlin, it's needed for its tools.

### Step 1: Install Bubblewrap

Bubblewrap is a command-line tool from Google that makes packaging your PWA into an Android App Bundle (AAB) incredibly simple.

```bash
# Install the Bubblewrap CLI globally
npm install -g @bubblewrap/cli
```

### Step 2: Initialize & Build Your Project

Navigate to your project directory and run the init command, pointing it to your live PWA's manifest file.

```bash
# Example using a placeholder URL
bubblewrap init --manifest https://your-ai-flappy-game.com/manifest.json
```

Bubblewrap will ask you a series of questions:
- **Application ID**: `com.yourdomain.ai_flappy_game` (use a unique package name).
- **Signing Key Information**: It will help you create a new keystore and key. **Back this up securely! You cannot update your app without it.**

After initialization is complete, build the Android App Bundle (AAB):

```bash
bubblewrap build
```

This will generate an `app-release.aab` file, which is what you'll upload to the Play Store.

### Step 3: Configure Digital Asset Links

To prove you own the website and allow the app to run in fullscreen (without the browser URL bar), you must set up a Digital Asset Link.

1.  Bubblewrap will have generated a file path for `assetlinks.json` during the build process.
2.  Upload this `assetlinks.json` file to your web server and make it accessible at:
    `https://your-ai-flappy-game.com/.well-known/assetlinks.json`

### Step 4: Publish to Google Play

1.  Log in to the **Google Play Console**.
2.  Create a new app, filling out all the required store listing information (app name, description, screenshots, privacy policy, etc.).
3.  Navigate to a release track (e.g., Internal Testing or Production).
4.  Upload the `app-release.aab` file generated by Bubblewrap.
5.  Roll out the release and submit it for review.

## Monetization & Cost Management Strategy

Calling the Gemini API costs money. A single theme generation in this app makes four API calls (1 for the theme description and 3 for the images of the character, background, and obstacle). Unrestricted free access would quickly become very expensive. Here is a robust strategy to make the app profitable and sustainable.

### Monetizing the App

A "freemium" model based on credits is ideal for this use case.

1.  **Generation Credits (In-App Purchase)**:
    - The core monetization method. Each AI theme generation costs one "Credit".
    - Give new users a small number of free credits (e.g., 3) to experience the main feature.
    - Sell packs of Credits via in-app purchases (e.g., 10 for $0.99, 50 for $3.99).
    - To implement IAPs in a TWA, use the **Digital Goods API**, a web standard that bridges your web app with the Play Store's billing system.

2.  **Rewarded Ads**:
    - Offer users a way to earn credits without paying. "Watch a short video ad to earn 1 free Generation Credit."
    - This is a great way to retain users who are unwilling to pay, while still generating revenue.

### Making AI Generation Economically Feasible

Controlling API costs is critical for survival.

1.  **The Credit System is Your First Line of Defense**: By directly linking API usage to revenue (or an ad view), you ensure your costs are covered. The price per credit should be calculated to cover the average cost of the API calls plus a profit margin.

2.  **Implement a Backend Server**: **Do not call the Gemini API directly from the client-side code in a production app.** Your API key would be exposed. A backend server (e.g., using Node.js/Express or Firebase Functions) is essential.
    - The client app sends a prompt to your server.
    - Your server authenticates the user, checks if they have enough credits, deducts a credit, and *then* makes the secure API call to Google.
    - This protects your API key and is where you manage user accounts and credits.

3.  **Rate Limiting**: Your backend should prevent users from spamming the generation endpoint, protecting you from abuse and unexpected costs.

4.  **Cache Popular Themes**: If a user enters a prompt that has been used before (e.g., "A cute pixel art cat"), your server can serve the cached assets from a database (like Firestore or Redis) instead of making new API calls. This can significantly reduce costs for popular themes.

5.  **Promote "Classic Mode"**: The offline "Classic Mode" is a fantastic cost-saving feature. It allows for unlimited play sessions without any API calls. Highlighting this option ensures high user engagement without increasing your operational expenses.
