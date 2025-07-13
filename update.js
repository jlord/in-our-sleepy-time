const fs = require("fs").promises;
const https = require("https");
const xml2js = require("xml2js");
const path = require("path");

// Function to fetch RSS feed
function fetchRSSFeed(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Function to fetch Apple Podcasts lookup data
function fetchAppleLookup(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Function to parse RSS XML and extract episode links
async function parseRSSFeed(xmlData) {
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  const episodes = [];
  const items = result.rss.channel[0].item || [];

  for (const item of items) {
    if (item.enclosure && item.enclosure[0] && item.enclosure[0].$.url) {
      episodes.push({
        title: item.title[0],
        link: item.enclosure[0].$.url,
        description: item.description ? item.description[0] : "",
        pubDate: item.pubDate ? item.pubDate[0] : "",
        guid: item.guid
          ? typeof item.guid[0] === "string"
            ? item.guid[0]
            : item.guid[0]._
          : "",
      });
    }
  }

  return episodes;
}

// Function to load played episodes
async function loadPlayedEpisodes(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, create it
      await fs.writeFile(filePath, "", "utf8");
      return [];
    }
    throw error;
  }
}

// Function to filter out already played episodes
function filterUnplayedEpisodes(episodes, playedLinks) {
  return episodes.filter((episode) => !playedLinks.includes(episode.link));
}

// Function to select a random episode
function selectRandomEpisode(episodes) {
  if (episodes.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * episodes.length);
  return episodes[randomIndex];
}

// Function to add episode to played list
async function addToPlayedList(filePath, episodeLink) {
  const content = await fs.readFile(filePath, "utf8");
  const newContent = content.trim()
    ? `${content.trim()}\n${episodeLink}\n`
    : `${episodeLink}\n`;
  await fs.writeFile(filePath, newContent, "utf8");
}

// Function to generate HTML page
function generateHTML(episode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>In Our Time - Daily Random Episode</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            margin-bottom: 30px;
        }
        .episode {
            margin: 20px 0;
        }
        .episode-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .episode-date {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }
        .episode-description {
            line-height: 1.6;
            margin-bottom: 30px;
            color: #555;
        }
        .buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .button {
            display: inline-block;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 18px;
            transition: all 0.3s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .download-button {
            background-color: #3498db;
        }
        .download-button:hover {
            background-color: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .apple-button {
            background-color: #000000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .apple-button:hover {
            background-color: #333333;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📻 In Our Time - Daily Random Episode</h1>
        <div class="episode">
            <div class="episode-title">${episode.title}</div>
            <div class="episode-date">${new Date(
              episode.pubDate,
            ).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>
            <div class="episode-description">${episode.description}</div>
            <div class="buttons">
                <a href="${episode.link}" class="button download-button" download>📥 Download MP3</a>
                <a href="https://podcasts.apple.com/podcast/id73330895?i=${episode.trackId || (episode.guid ? episode.guid.replace(/^.*:/, "").replace(/^.*\//, "").replace(/\.[^.]*$/, "") : "")}" class="button apple-button" target="_blank">
                  🍎 Open in Apple Podcasts
                </a>
            </div>
        </div>
        <div class="footer">
            <p>Updated daily at 5am UTC</p>
            <p>A random episode from the BBC's "In Our Time" podcast with Melvyn Bragg</p>
        </div>
    </div>
</body>
</html>`;
}

// Function to get Apple Podcasts trackId for an episode
async function getAppleTrackId(episodeGuid) {
  try {
    console.log("Fetching Apple Podcasts lookup data...");
    const appleData = await fetchAppleLookup("https://itunes.apple.com/lookup?id=73330895&entity=podcastEpisode&limit=500");

    // Filter for podcast episodes only
    const podcastEpisodes = appleData.results.filter(result => result.wrapperType === "podcastEpisode");
    console.log(`Found ${podcastEpisodes.length} podcast episodes in Apple lookup`);

    // Find the episode with matching episodeGuid
    const matchingEpisode = podcastEpisodes.find(episode => episode.episodeGuid === episodeGuid);

    if (matchingEpisode) {
      console.log(`Found matching Apple episode with trackId: ${matchingEpisode.trackId}`);
      return matchingEpisode.trackId;
    } else {
      console.log(`No matching Apple episode found for guid: ${episodeGuid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Apple Podcasts data:", error);
    return null;
  }
}

// Main function
async function main() {
  try {
    console.log("Starting daily podcast update...");

    const RSS_URL = "https://podcasts.files.bbci.co.uk/b006qykl.rss";
    const PLAYED_FILE = "played.txt";
    const OUTPUT_FILE = "index.html";

    // Ensure played.txt exists
    await loadPlayedEpisodes(PLAYED_FILE);

    // Fetch RSS feed
    console.log("Fetching RSS feed...");
    const rssData = await fetchRSSFeed(RSS_URL);

    // Parse RSS feed
    console.log("Parsing RSS feed...");
    const episodes = await parseRSSFeed(rssData);
    console.log(`Found ${episodes.length} episodes in feed`);

    // Load played episodes
    const playedLinks = await loadPlayedEpisodes(PLAYED_FILE);
    console.log(`Found ${playedLinks.length} previously played episodes`);

    // Filter unplayed episodes
    const unplayedEpisodes = filterUnplayedEpisodes(episodes, playedLinks);
    console.log(`${unplayedEpisodes.length} unplayed episodes available`);

    // Select random episode
    let selectedEpisode = selectRandomEpisode(unplayedEpisodes);



    if (!selectedEpisode) {
      console.log("No unplayed episodes available! Starting over...");
      // Reset played list if all episodes have been played
      await fs.writeFile(PLAYED_FILE, "", "utf8");
      const freshEpisode = selectRandomEpisode(episodes);
      if (freshEpisode) {
        selectedEpisode = freshEpisode;
      } else {
        throw new Error("No episodes found in feed");
      }
    }

    console.log(`Selected episode: ${selectedEpisode.title}`);

    // Get Apple Podcasts trackId for the selected episode
    const trackId = await getAppleTrackId(selectedEpisode.guid);
    if (trackId) {
      selectedEpisode.trackId = trackId;
    }

    // Add to played list
    await addToPlayedList(PLAYED_FILE, selectedEpisode.link);

    // Generate HTML
    const html = generateHTML(selectedEpisode);
    await fs.writeFile(OUTPUT_FILE, html, "utf8");

    console.log("Daily podcast update completed successfully!");
  } catch (error) {
    console.error("Error updating podcast:", error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}
