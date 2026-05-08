// module-federation.config.ts
import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'main',
  manifest: {
    filePath: 'static',
  },
  filename: 'static/mainEntry.js',
  exposes: {
    './MainButton': './src/components/MainButton.tsx',
  },
  // 连接远程应用，需要先启动远程应用
  // remotes: {
  //   child: `child@http://localhost:3001/static/mf-manifest.json`,
  // },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});