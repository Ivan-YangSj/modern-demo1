import '@modern-js/runtime/registry/index'; // 这一行必须引入，它会默认导入微前端运行时依赖
import { render } from '@modern-js/runtime/browser';
import { createRoot } from '@modern-js/runtime/react';
import { createBridgeComponent } from '@module-federation/modern-js-v3/react-v19';

const ModernRoot = createRoot();
export const provider = createBridgeComponent({
  rootComponent: ModernRoot,
  render: (Component, dom) =>
    render(Component as React.ReactElement<{ basename: string }>, dom),
});

export default provider;