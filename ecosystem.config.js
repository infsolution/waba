module.exports = {
  apps: [
    {
      name: 'minha-api',
      script: 'dist/main.js',

      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      autorestart: true,
      watch: false,

      max_memory_restart: '500M',

      time: true,
    },
  ],
};
