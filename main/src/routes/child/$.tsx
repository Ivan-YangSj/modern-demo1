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
