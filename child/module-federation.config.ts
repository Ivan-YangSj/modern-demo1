import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'child',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  // 到处自己的组件
  // manifest: {
  //   filePath: 'static',
  // },
  // filename: 'static/childEntry.js',
  // exposes: {
  //   './ChildButton': './src/components/ChildButton.tsx',
  // },
  remotes: {
    main: 'main@http://localhost:3000/static/mf-manifest.json',
  },
});