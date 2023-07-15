<template>
  <div
    id="app"
    :class="{ 'is-invisible': !isPlaying && videoQueue.length === 0 }"
  >
    <div ref="playerDiv"></div>
    <div class="loading-bar" v-if="isPlaying">
      <div class="progress" :style="{ width: progressBarWidth }"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
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

    const playNextVideo = () => {
      if (videoQueue.value.length > 0 && player && !currentVideo) {
        currentVideo = videoQueue.value[0]; // Get the next video in the queue without removing it

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
        videoQueue.value.shift(); // Remove the completed video from the queue
        if (videoQueue.value.length === 0) {
          isPlaying.value = false; // No videos left in the queue, hide the div
        }
        playNextVideo();
      }
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        skipToNextVideo();
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
            origin: window.location.origin, // Set the origin parameter
          },
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      };

      const options = {
        identity: {
          username: "tejwidendk31wwh1a3as0b2erystoi",
          password: "oauth:ndg2e6d7s9d5nlabg5rbk5vwn3c5sr",
        },
        channels: ["Lewonade"],
      };

      const client = new tmi.Client(options);

      client.connect();

      client.on("message", (channel, tags, message, self) => {
        if (self) return;

        const command = message.toLowerCase();
        if (command === "!skip") {
          skipToNextVideo();
        } else if (command === "!pause") {
          player.pauseVideo();
        } else if (command === "!resume") {
          player.playVideo();
        } else if (command === "!stop") {
          player.stopVideo();
          isPlaying.value = false;
        } else if (command === "!start") {
          playNextVideo();
        } else {
          const isChannelPointReward =
            tags["custom-reward-id"] === "47c5bee7-72c6-45a9-a91d-f64c495eb2cd";

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

              if (!currentVideo && !isVideoLoaded) {
                playNextVideo();
              }
            }
          }
        }
      });
    });

    const progressBarWidth = computed(() => {
      if (player && currentVideo) {
        const currentTime = player.getCurrentTime();
        const videoDuration =
          currentVideo.endTimeSeconds - currentVideo.startTimeSeconds;
        const progressPercentage =
          (currentTime - currentVideo.startTimeSeconds) / videoDuration;
        return `${progressPercentage * 100}%`;
      }
      return "0%";
    });

    return {
      playerDiv,
      isPlaying,
      videoQueue,
      progressBarWidth,
    };
  },
};
</script>

<style>
.is-invisible {
  display: none;
}

.loading-bar {
  width: 100%;
  height: 10px;
  background-color: #ccc;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #ff0000;
  width: 0;
  transition: width 1s linear;
}
</style>
