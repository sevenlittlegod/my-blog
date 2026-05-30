module.exports = {
  apps: [{
    name: "my-blog",
    cwd: __dirname,
    script: "server.js",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "450M",
    env: {
      NODE_ENV: "production",
      HOSTNAME: "0.0.0.0",
      PORT: 3000,
      AUTH_URL: "https://lingeyou.top",
      AUTH_TRUST_HOST: "true",
    },
  }],
};
