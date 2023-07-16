# Mediashare using Channelpoints

This repository contains a Vue.js application that enables youre viewers to use channelpoints to play YouTube videos on a locally hosted website (localhost:8080) that can be displayed in OBS.

## Installation and Usage

Follow the instructions below to set up and run the application:

1. Install node.js and create the actual vue.js files needed for this application in Visual Studio.

  >vue create mediashare-channelpoints
   
   
2. Clone the repository into your local new mediashare-channelpoints repository (should work, hopefully. if not just replace the existing App.vue and index.js coding):

  >git clone https://github.com/lewonade/mediashare-channelpoints.git



4. Navigate to the project directory via your terminal inside VisualStudio or CMD:

  >cd mediashare-channelpoints



4. Install the dependencies:

- >npm install

- >npm install tmi.js



5. Open the Code in Visual Studio and follow the instructions in the comments. 


6. Start the development server:

>npm run serve



7. Connect the locally hostet (localhost:8080) application to OBS and configure the stream settings.

8. Use Twitch chat commands to control the YouTube playback in OBS.
   
   
- **!skip**
   - Skips the Video, either to the next video in the queue or if there is no next video the player goes dormant until a new video gets submitted.
     
- **!pause**
  - Pauses the video that is currently playing.
    
- **!resume**
  - Resumes playing a paused video.
    
- **!stop**
  - Stops playing videos but still saves submitted ones in the queue
    
- **!start**
  - Un-Stops videos and the programm will go back to playing videos normally.


**I've made it work for me, if you need an example of what it looks like or you wanna test it out, i've always got it up and running while i stream https://www.twitch.tv/lewonade.**
ik shameless plug (;

   
