module.exports = {
  apps: [
    {
      name: 'echoray-app',
      cwd: './apps/app',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'echoray-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'echoray-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'echoray-email',
      cwd: './apps/email',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    },
    {
      name: 'echoray-studio',
      cwd: './apps/studio',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      }
    }
  ]
};
