import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'child',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  manifest: {
    filePath: 'static',
  },
  filename: 'static/childEntry.js',
  exposes: {
    './ChildButton': './src/components/ChildButton.tsx',
    './app': './src/exportApp.tsx',
  },
  // 消费主应用共享，如果没有消费，可以去掉
  remotes: {
    main: 'main@http://localhost:3000/static/mf-manifest.json',
  },
});