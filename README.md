# Modern.js

[官方文档](https://modernjs.dev/zh/)



## Modern.js 介绍

**Modern.js 是一个基于 React 的渐进式 Web 开发框架**。 

`内置有路由、数据管理（不是状态管理）、国际化、联邦模块、服务端渲染等功能。`





## 快速使用

### 环境准备

在开始使用前，你需要安装 [Node.js](https://nodejs.org/)，并保证 Node.js 版本不低于 `v20.19.5`，我这里使用的是 `V24.15 LTS`版本。

推荐使用 [pnpm](https://pnpm.io/installation) 来管理依赖 :

~~~cmd
npm install -g pnpm
~~~



### 创建项目

~~~cmd
npx @modern-js/create@latest myapp

~~~

由于我需要使用联邦模块功能，所以直接创建 `main`和`child` 两个项目

![目录结构](\images\1778143626751.png)



### 项目结构说明

```md
.
├── modern.config.ts   	  # 配置文件
├── biome.json   	      # 代码风格配置文件
├── package.json
├── README.md
├── src				
│   ├── modern-app-env.d.ts
│   ├── modern.runtime.ts
│   └── routes			 # 路由页面文件
│       ├── index.css
│       ├── layout.tsx    # 布局组件（可选）
│       ├── page.tsx      # 首页组件（/ 路由）
│       ├── about
│       │   └── page.tsx  # 关于页面（/about 路由）
│       └── blog
│           ├── page.tsx  # 博客列表页（/blog 路由）
│           └── [id]
│				└── page.tsx  # 博客详情页（/blog/:id 路由）
└── tsconfig.json
```





### 启动项目

在项目中安装依赖，完成后即可启动

~~~cmd
pnpm install

pnpm run dev
~~~

<img src="\images\1778143400799.png" alt="运行成功" style="zoom: 50%;" />





## 基础功能



请查阅文档





## 模块联邦

 模块联邦（Module Federation）是一种 JavaScript 应用分治的架构模式，它允许你在多个 JavaScript 应用之间共享代码和资源。 



### 组件共享

#### 安装插件

分别为2个应用安装插件

~~~cmd
pnpm add @module-federation/modern-js-v3
~~~



#### 注册插件

安装插件后，需要在 `modern.config.js` 中注册插件：

```ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  plugins: [appTools(), moduleFederationPlugin()],
});
```





#### 生产者导出模块

生产者即分享端，将自己的代码共享给其他应用。联邦模块可以双方都是分享端（既是生产者，又是消费者），所以不能说是主应用。

先在 `main` 应用创建一个共享的组件。

```tsx
// src/components/MainButton.tsx
import React from 'react';

const MainButton = () => {
  return <button type="button">Main Button</button>;
};

export default MainButton;
```



然后，在项目根目录添加 `module-federation.config.ts`，配置 Module Federation 模块的名称、共享依赖和导出内容：

```tsx
// module-federation.config.ts
import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'main',
  manifest: {
    filePath: 'static',
  },
  filename: 'static/remoteEntry.js',
  exposes: {
    './MainButton': './src/components/MainButton.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
```

>Tip
>
>在上述代码块中，我们为 Module Federation 导出的 `manifest` 和 `remoteEntry.js` 都设置了 `static` 前缀，这是因为 Modern.js 要求将所有需要暴露的资源都放在 `static/` 目录下，Modern.js 的服务器在生产环境时也只会托管 `static/` 目录。



 另外，还需要在 `modern.config.ts` 配置固定端口，让消费者可以通过此端口访问生产者的资源： 

```ts
// modern.config.ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
```





#### 消费者使用模块

消费者即使用端， 使用生产者导出的模块。 

在`child`项目根目录添加 `module-federation.config.ts`，配置 Module Federation 模块的名称、共享依赖和使用的远程模块： 

```ts
// module-federation.config.ts

import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'child',
  remotes: {
    remote: 'remote@http://localhost:3000/static/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
```

`mf-manifest.json` 是生产者在打包后产出的文件，包含了生产者导出的所有模块信息。 





现在可以在消费者端任意位置使用生产者模块：

```tsx
// src/routes/remote/page.tsx
import React, { Suspense, type JSX } from 'react';
import MainButton from 'main/Button';

const Index = (): JSX.Element => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <MainButton />
      </Suspense>
    </div>
  );
};

export default Index;
```



 此时 `remote/Button` 引入会出现类型错误，模块联邦在生产者构建时自动生成远程模块的类型定义，在消费者构建时自动下载，为此我们需要在 `tsconfig.json` 中添加新的 `path` 。 

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "*": ["./@mf-types/*"]
    }
  }
}
```





### 应用级别模块

可以将一个应用嵌入另一个应用中访问。



#### 生产者导出模块

直接导出组件级别的模块不同， 需要为应用级别模块创建一个独立的入口来作为 `Module Federation` 的导出。 

在 `child` 创建入库文件 ` src/exportApp.tsx `

~~~tsx
// src/exportApp.tsx
import '@modern-js/runtime/registry/index'; // 这一行必须引入，它会默认导入微前端运行时依赖
import { render } from '@modern-js/runtime/browser';
import { createRoot } from '@modern-js/runtime/react';
import { createBridgeComponent } from '@module-federation/modern-js-v3/react-v19';  //react-v19 使用的是哪个版本就用 v版本

const ModernRoot = createRoot();
export const provider = createBridgeComponent({
  rootComponent: ModernRoot,
  render: (Component, dom) =>
    render(Component as React.ReactElement<{ basename: string }>, dom),
});

export default provider;
~~~

 该文件会将入口的应用根组件传递给 Bridge API，并通过 Bridge 将调用渲染函数将其渲染到指定的节点上。 



然后配置应用共享

```ts
// module-federation.config.ts
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
```



#### 消费者使用模块

如果要 `/child` 下的所有路由都能进入应用级模块中，需要增加通配路由 `src/routes/remote/$.tsx`。 

~~~tsx
src/routes/child/$.tsx
import { useLocation } from "@modern-js/runtime/router";
import { createRemoteAppComponent } from "@module-federation/modern-js-v3/react";
import { loadRemote } from "@module-federation/modern-js-v3/runtime";
import { useEffect } from "react";

const ErrorBoundary = (info?: { error: { message: string } }) => {
  return (
    <div>
      <h2>This is ErrorBoundary Component, Something went wrong:</h2>
      <pre style={{ color: "red" }}>{info?.error.message}</pre>
    </div>
  );
};
const Loading = <div>loading...</div>;
const RemoteApp = createRemoteAppComponent({
  loader: () => loadRemote("child/app"),
  fallback: ErrorBoundary,
  loading: Loading,
});

export default function RemoteAppRoute() {
  const { pathname, search, hash } = useLocation();
  const fullPath = `${pathname}${search}${hash}`;

  // 保持远程路由与主机URL同步，不加会导致远程路由无法正常工作
  useEffect(() => {
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: window.history.state })
    );
  }, [fullPath]);

  return <RemoteApp basename="/child" />;
}
~~~



然后在 `module-federation.config.ts `配置应用连接

~~~ts
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
  remotes: {
    child: `child@http://localhost:3001/static/mf-manifest.json`,
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
~~~



#### 启动应用

注意：这时候运行项目会报错

![1778212045821](\images\1778212045821.png)

文档中没有说明，安装 `react-router-dom` 即可正常启动

~~~cmd
pnpm add react-router-dom
~~~



 现在，生产者应用和消费者应用都已经搭建完毕，我们可以在本地运行 `pnpm dev` 启动两个应用。 

 消费者应用访问 `/child` 路由时，会进入生产者应用中。访问 `http://localhost:3000/child`，可以看到页面中已经包含了生产者的远程模块的完整页面。 

