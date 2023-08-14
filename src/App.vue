<template>
  <div>
    <div :class="{ 'is-invisible': !isPlaying || isMusicVideo }">
      <div id="app">
        <div ref="playerDiv"></div>
        <div class="progress" :style="{ width: playerWidth + 'px' }">
          <div
            class="progress-bar"
            :style="{
              width: progress + '%',
              'background-color': progressBarColor,
            }"
          ></div>
        </div>
      </div>
      <div class="twitch-username" v-if="currentVideo && currentVideo.username">
        {{ currentVideo.username }}
      </div>
    </div>

    <div ref="emotePlayerDiv" class="is-invisible"></div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
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
    const progress = ref(0);
    const playerWidth = ref(0);
    const progressBarColor = ref("#3366ff");
    const isMusicVideo = ref(false);

    const updateProgress = () => {
      if (currentVideo && player && player.getDuration) {
        const currentTime = player.getCurrentTime();
        const duration =
          currentVideo.endTimeSeconds !== undefined
            ? currentVideo.endTimeSeconds - currentVideo.startTimeSeconds
            : player.getDuration();
        const adjustedCurrentTime =
          currentVideo.startTimeSeconds !== undefined
            ? currentTime - currentVideo.startTimeSeconds
            : currentTime;
        progress.value = (adjustedCurrentTime / duration) * 100;
        playerWidth.value = player.getIframe().clientWidth;
      } else {
        progress.value = 0;
      }
    };

    const loadVideo = () => {
      if (currentVideo && player) {
        player.loadVideoById({
          videoId: currentVideo.videoId,
          startSeconds: currentVideo.startTimeSeconds || 0,
          endSeconds: currentVideo.endTimeSeconds,
        });
        isVideoLoaded = true;
        progressBarColor.value =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
      }
    };

    const playNextVideo = () => {
      if (videoQueue.value.length > 0 && player) {
        currentVideo = videoQueue.value.shift();
        isMusicVideo.value = currentVideo.isMusic;
        loadVideo();
      } else {
        isPlaying.value = false;
        isVideoLoaded = false;
      }
    };

    const skipToNextVideo = () => {
      if (currentVideo) {
        player.stopVideo();
        currentVideo = null;
        isVideoLoaded = false;
        if (videoQueue.value.length === 0) {
          isPlaying.value = false;
        } else {
          playNextVideo();
        }
      }
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        playNextVideo();
      } else if (event.data === window.YT.PlayerState.PLAYING) {
        isPlaying.value = true;
      }
    };

    const emoteVideoMap = {
      lewonaHEHEHEHA: "12r5lYwIFPA",
      lewonaBUHUHUHU: "RT_RzWrSrac",
      lewonaGRRR: "GF0fG3KRhRo",
      lewonaThumbs: "tjDS1PAqKUw",
    };

    const emotePlayerDiv = ref(null);
    let emotePlayer;

    const loadEmoteVideo = (videoId) => {
      emotePlayer.loadVideoById({
        videoId: videoId,
      });
      emotePlayer.playVideo();
    };

    onMounted(() => {
      window.onYouTubeIframeAPIReady = () => {
        player = new window.YT.Player(playerDiv.value, {
          height: "390",
          width: "640",
          playerVars: {
            origin: window.location.origin,
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          },
          events: {
            onStateChange: onPlayerStateChange,
          },
        });

        emotePlayer = new window.YT.Player(emotePlayerDiv.value, {
          height: "0",
          width: "0",
          playerVars: {
            origin: window.location.origin,
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          },
        });
      };

      const options = {
        identity: {
          username: "YOUR-CLIENT-ID", // Go to this Link https://dev.twitch.tv/console/apps and add a new Applikation with the URL beeing 'https://localhost', everything else doesn't matter.
          password: "oauth:oauth:abcdefghijklmnopqrstuvwxyz", // To retrieve your oautch-token you'll have to go to this website https://twitchapps.com/tmi/
        },
        channels: ["Lewonade"], // Add you Twitch-Channel name. so the chatbot knows what chat to read.
      };

      const client = new tmi.Client(options);

      client.connect();

      client.on("message", (channel, tags, message, self) => {
        if (self) return;

        const command = message.toLowerCase();
        const isPrivilegedUser =
          tags.badges &&
          (tags.badges.vip || tags.badges.moderator || tags.badges.broadcaster);

        if (
          command === "!skip" &&
          isPlaying.value &&
          (isPrivilegedUser || tags.username === currentVideo.username)
        ) {
          skipToNextVideo();
        } else if (command === "!pause" && isPrivilegedUser) {
          player.pauseVideo();
        } else if (command === "!resume" && isPrivilegedUser) {
          player.playVideo();
        } else {
          const isChannelPointReward =
            tags["custom-reward-id"] === ""YOUR-CUSTOM-REWARD-ID"; // You will have to create a channelpoint-reward on which the 'Viewer must enter text' is enabled.
          // Use your channelpoint reward with a random word once and got to this website 'https://www.instafluff.tv/TwitchCustomRewardID/?channel=YOUR-TWITCH-USERNAME' <-- don't forget to edit the URL

          if (isChannelPointReward) {
            const pattern =
              /(\d{2}:\d{2}-\d{2}:\d{2})?\s*(https:\/\/)?(www\.)?youtube\.com\/(watch\?v=|shorts\/)(\S{11})/;

            const matches = message.match(pattern);

            if (matches) {
              const videoId = matches[5];
              const timeRange = matches[1];
              let startTimeSeconds, endTimeSeconds;

              if (timeRange) {
                const times = timeRange
                  .split("-")
                  .map((t) =>
                    t.split(":").reduce((acc, time) => 60 * acc + +time)
                  );
                startTimeSeconds = times[0];
                endTimeSeconds = times[1];
              }

              videoQueue.value.push({
                videoId: videoId,
                username: tags.username,
                startTimeSeconds: startTimeSeconds,
                endTimeSeconds: endTimeSeconds,
                isMusic: message.toLowerCase().includes("music"),
              });

              if (!isPlaying.value && !isVideoLoaded) {
                playNextVideo();
              }
            }
          }

          if (emoteVideoMap[message]) {
            loadEmoteVideo(emoteVideoMap[message]);
          }
        }
      });

      setInterval(updateProgress, 10);
    });

    return {
      playerDiv,
      isPlaying,
      progress,
      playerWidth,
      progressBarColor,
      isMusicVideo,
      emotePlayerDiv,
    };
  },
};
</script>

<style>
.is-invisible {
  display: none;
}
.progress {
  height: 15px;
  background-color: #eee;
  border-radius: 7px;
  overflow: hidden;
}
.progress-bar {
  height: 15px;
  background-color: #3366ff;
}
#app {
  padding: 20px;
}
</style>
