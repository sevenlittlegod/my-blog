module.exports = {
  apps: [{
    name: "my-blog",
    script: "node_modules/.bin/next",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
  }],
};
