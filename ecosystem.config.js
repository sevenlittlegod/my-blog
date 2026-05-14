module.exports = {
  apps: [{
    name: "my-blog",
    script: "server.js",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "450M",
    env: {
      NODE_ENV: "production",
      HOSTNAME: "0.0.0.0",
      PORT: 3000,
    },
  }],
};
