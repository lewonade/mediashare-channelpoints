const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.twitch.tv',
        changeOrigin: true,
        pathRewrite: { '^/api': '/kraken' },
        secure: false,
        headers: {
          'Client-ID': 'YOUR_TWITCH_CLIENT_ID',
          'Authorization': 'Bearer YOUR_TWITCH_AUTH_TOKEN',
        },
      },
    },
  },
};


