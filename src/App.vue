<template>
  <div :class="{ 'is-invisible': hideWebsite }">
    <div
      id="app"
      :class="{ 'is-invisible': !isPlaying && videoQueue.length === 0 }"
    >
      <div ref="playerDiv"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import tmi from "tmi.js";

export default {
  name: "App",
  setup() {
    const playerDiv = ref(null);
    const videoQueue = ref([]);
    let player;
    let currentVideo = null;
    let isVideoLoaded = false;
    const isPlaying = ref(false);
    const hideWebsite = ref(false);

    
    const privilegedUser = "Lewonade"; // Add a variable to store the privileged user that can use the chat commands

    const playNextVideo = () => {
      if (videoQueue.value.length > 0 && player && !currentVideo) {
        currentVideo = videoQueue.value[0];

        player.loadVideoById({
          videoId: currentVideo.videoId,
          startSeconds: currentVideo.startTimeSeconds,
          endSeconds: currentVideo.endTimeSeconds,
        });

        isVideoLoaded = true;
      }
    };

    const skipToNextVideo = () => {
      if (currentVideo) {
        player.stopVideo();
        currentVideo = null;
        isVideoLoaded = false;
        videoQueue.value.shift();
        if (videoQueue.value.length === 0) {
          isPlaying.value = false;
        } else {
          playNextVideo();
        }
      }
    };

    const stopPlaying = () => {
      player.stopVideo();
      isPlaying.value = false;
      hideWebsite.value = true;
    };

    const startPlaying = () => {
      hideWebsite.value = false;
      skipToNextVideo(); // Skip the current video
      playNextVideo(); // Play the next video
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        skipToNextVideo();
        playNextVideo(); // Play the next video after the current one ends
      } else if (event.data === window.YT.PlayerState.PLAYING) {
        isPlaying.value = true;
      }
    };

    onMounted(() => {
      window.onYouTubeIframeAPIReady = () => {
        player = new window.YT.Player(playerDiv.value, {
          height: "390",
          width: "640",
          playerVars: {
            origin: window.location.origin,
            autoplay: 1, // Enable autoplay
          },
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      };

      const options = {
        identity: {
          username: "YOUR-CLIENT-ID", // Go to this Link https://dev.twitch.tv/console/apps and add a new Applikation with the URL beeing 'https://localhost', everything else doesn't matter.
          password: "oauth:abcdefghijklmnopqrstuvwxyz", // To retrieve your oautch-token you'll have to go to this website https://twitchapps.com/tmi/
        },
        channels: ["YOUR-TWITCH-USERNAME"], // Put in your Twitch-Username.
      };

      const client = new tmi.Client(options);

      client.connect();

      client.on("message", (channel, tags, message, self) => {
        if (self) return;

        const command = message.toLowerCase();
        const isPrivilegedUser =
          tags.username.toLowerCase() === privilegedUser.toLowerCase();

        if (command === "!skip" && isPrivilegedUser) {
          skipToNextVideo();
        } else if (command === "!pause" && isPrivilegedUser) {
          player.pauseVideo();
        } else if (command === "!resume" && isPrivilegedUser) {
          player.playVideo();
        } else if (command === "!stop" && isPrivilegedUser) {
          stopPlaying();
        } else if (command === "!start" && isPrivilegedUser) {
          startPlaying();
        } else {
          const isChannelPointReward =
            tags["custom-reward-id"] === "YOUR-CUSTOM-REWARD-ID"; // You will have to create a channelpoint-reward on which the 'Viewer must enter text' is enabled.
                                                                  // Use your channelpoint reward with a random word once and got to this website 'https://www.instafluff.tv/TwitchCustomRewardID/?channel=YOUR-TWITCH-USERNAME' <-- don't forget to edit the URL

          if (isChannelPointReward) {
            const pattern =
              /(\d{2}:\d{2}-\d{2}:\d{2})?\s?(https:\/\/(www\.|m\.)?youtube\.com\/(watch\?v=|shorts\/)?[A-Za-z0-9_-]+|https:\/\/youtu\.be\/[A-Za-z0-9_-]+)/;

            if (pattern.test(message)) {
              const [, time, url] = message.match(pattern);
              const [startTime, endTime] = (time || "00:00-00:00").split("-");

              let videoId;
              if (url.includes("youtu.be")) {
                videoId = url.split("/")[3];
              } else if (url.includes("watch?v=")) {
                videoId = url.split("=")[1];
              } else if (url.includes("shorts/")) {
                videoId = url.split("/")[4];
              }

              const [startMinutes, startSeconds] = startTime.split(":");
              const [endMinutes, endSeconds] = endTime.split(":");

              const startTimeSeconds =
                Number(startMinutes) * 60 + Number(startSeconds);
              const endTimeSeconds =
                Number(endMinutes) * 60 + Number(endSeconds);

              videoQueue.value.push({
                videoId,
                startTimeSeconds,
                endTimeSeconds,
              });

              if (!currentVideo && !isVideoLoaded && !hideWebsite.value) {
                playNextVideo();
              }
            }
          }
        }
      });

      player.addEventListener("onStateChange", onPlayerStateChange);
    });

    watch(videoQueue, () => {
      if (!currentVideo && !isVideoLoaded && !hideWebsite.value) {
        playNextVideo();
      }
    });

    return {
      playerDiv,
      isPlaying,
      videoQueue,
      hideWebsite,
    };
  },
};
</script>

<style>
.is-invisible {
  display: none;
}
</style>
