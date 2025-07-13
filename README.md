# In Our Sleepy Time

A static GitHub Pages site that presents a random episode of the BBC podcast "In Our Time" daily.

## Overview

This project automatically selects and displays a random episode from the BBC's "In Our Time" podcast every day at 5am UTC. It uses GitHub Actions to update a static HTML page with a new episode, ensuring that previously played episodes are tracked and not repeated until all episodes have been featured. Each episode is presented with two convenient buttons - one to download the MP3 directly and another to open the episode in Apple Podcasts.

## Features

- Daily automatic updates via GitHub Actions
- Tracks previously played episodes to avoid repetition
- Simple, clean interface with two listening options:
  - Direct MP3 download button
  - Open in Apple Podcasts button
- Fully static site compatible with GitHub Pages
- Resets automatically when all episodes have been played

## Setup Instructions

### 1. Fork or Clone the Repository

First, fork this repository to your GitHub account or clone it locally.

### 2. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to the "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

Your site will be available at: `https://[your-username].github.io/[repository-name]/`

### 3. Enable GitHub Actions

GitHub Actions should be enabled by default. The workflow will run automatically:
- Every day at 5am UTC
- When manually triggered from the Actions tab

### 4. Initial Setup

To create the first episode page manually:

```bash
# Install dependencies
npm install

# Run the update script
npm run update
```

This will create:
- `index.html` - The main page displaying the selected episode with download and Apple Podcasts buttons
- `played.txt` - A file tracking previously played episodes

### 5. Commit and Push

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

## How It Works

1. **Daily Trigger**: A GitHub Action runs daily at 5am UTC
2. **Fetch RSS**: The script fetches the latest RSS feed from the BBC
3. **Track History**: It checks `played.txt` to see which episodes have been played
4. **Random Selection**: Selects a random unplayed episode
5. **Update Site**: Generates a new `index.html` with the selected episode
6. **Auto Commit**: Commits changes with the message "Daily podcast update"

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── daily-update.yml    # GitHub Action workflow
├── update.js                   # Main script for selecting episodes
├── package.json               # Node.js dependencies
├── played.txt                 # List of played episode URLs
├── index.html                 # Generated static page
└── README.md                  # This file
```

## Manual Update

To manually trigger an update:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Daily Podcast Update"
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

Or run locally:
```bash
npm run update
```

## Customization

You can customize the appearance by modifying the HTML template in `update.js`. The generated HTML includes basic styling that should work well on both desktop and mobile devices.

## Troubleshooting

### No episodes appearing
- Check that the RSS feed URL is accessible
- Ensure GitHub Actions have write permissions to your repository
- Check the Actions tab for any error messages

### All episodes have been played
- The script automatically resets `played.txt` when all episodes have been played
- You can manually reset by deleting the contents of `played.txt`

## License

MIT