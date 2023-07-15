# youtube-twitch-obs

## Project setup
```
YouTube Twitch OBS
This code provides a Vue.js application that integrates YouTube and Twitch functionalities into OBS (Open Broadcaster Software). It allows you to play videos from YouTube within OBS and control the playback using Twitch chat commands.

Files
App.vue
This file contains the main Vue component for the application. It handles the YouTube player, video queue management, playback controls, and Twitch integration.

main.js
This file initializes the Vue application by creating an instance of the App component and mounting it to the HTML element with the id app.

index.html
This file is the main HTML template for the application. It includes the necessary meta tags and imports the YouTube iframe API. The Vue application is mounted within the <div id="app"></div> element.

proxy.js
This file provides a proxy server implemented using Express.js. It allows cross-origin requests to the Twitch API by forwarding the requests from the /twitch/api endpoint to the actual Twitch API endpoint. The server runs on port 3000.

How to Use
Install the required dependencies using npm or yarn.
Start the proxy server by running node proxy.js.
Start the Vue application by running npm run serve or yarn serve.
Access the application in a web browser at the provided URL.
Connect the application to OBS and configure the stream settings.
Use Twitch chat commands to control the YouTube playback in OBS.
Note: You may need to modify the Twitch API client ID and other configuration options in the code to match your own setup.

Dependencies
The code relies on the following dependencies:

Vue.js: A JavaScript framework for building user interfaces.
tmi.js: A Twitch Messaging Interface library for interacting with the Twitch chat.
Express.js: A web application framework for creating the proxy server.
Axios: A promise-based HTTP client for making API requests.
Make sure to install these dependencies before running the code.

License
This code is licensed under the MIT License. Feel free to modify and use it according to your needs.
```


