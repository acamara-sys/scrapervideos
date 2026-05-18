const express = require("express");

const app = express();

async function getVideo(videoId) {
  try {
    
    const API_KEY = "AIzaSyAqybz3aeMayBhnQH4GKoBcYyFYLgKC_oo" // API Google Cloud


    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      console.log("Couldn't fetch JSON response");
      return;
    }

    const data = await response.json();

    console.log(data);

    if (data.items.length === 0) {
      console.log("Video not found");
      return;
    }

    const video = data.items[0];

    console.log("Title:", video.snippet.title);
    console.log("Status:", video.status.privacyStatus)
    console.log("Embeddable:", video.status.embeddable);
    console.log(video.status.license);
  } catch (error) {
    console.error(error);
  }
}

app.listen(3000, () => {
  console.log("Server running");
});

getVideo("4AXb40hg4l8");