import { Link } from "umi";
import "./index.less";
import {
  RemoteConnectPersistance,
  TonhubConnectProvider,
  useTonhubConnect,
} from "react-ton-x";
import useLocalStorage from "use-local-storage";
import isMobile from "is-mobile";
import QRCode from "react-qr-code";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TonClient } from "ton";
import { useEffect } from "react";
// TODO change to L3 client
export const tc = new TonClient({
  endpoint: "https://scalable-api.tonwhales.com/jsonRPC",
});

let wasPendingConnectionChecked = false;
export default function Layout(props: any) {
  const queryClient = new QueryClient();

  const [connectionState, setConnectionState] =
    useLocalStorage<RemoteConnectPersistance>("connection", {
      type: "initing",
    });

  const connect = useTonhubConnect();
  const isConnected = connect.state.type === "online";
  console.log("1", connect.state.type);
  // fix for stale connections, can probably be improved
  useEffect(() => {
    window.Telegram.WebApp.ready();
    if (!wasPendingConnectionChecked && connectionState?.type === "pending") {
      localStorage.removeItem("connection");
      window.location.reload();
    }
    wasPendingConnectionChecked = true;
  }, [connectionState]);

  return (
    <QueryClientProvider client={queryClient}>
      <TonhubConnectProvider
        network="mainnet"
        url="https://ton.org/"
        name="TON TWA BOT"
        debug={false}
        connectionState={connectionState}
        setConnectionState={(s) => {
          setConnectionState(s as RemoteConnectPersistance);
        }}
      >
        <_TonConnecterInternal {...props} />
      </TonhubConnectProvider>
    </QueryClientProvider>
  );
}

function _TonConnecterInternal(props: any) {
  const connect = useTonhubConnect();
  const isConnected = connect.state.type === "online";
  console.log(connect.state.type);
  return (
    <>
      {!isConnected && <TonConnect />}
      {isConnected && (
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          {/* <TonWalletDetails /> */}
          {props.children}
        </div>
      )}
    </>
  );
}

function TonConnect() {
  const connect = useTonhubConnect();

  if (connect.state.type === "initing") {
    return <span>Waiting for session</span>;
  }
  if (connect.state.type === "pending") {
    return (
      <div>
        {isMobile() && (
          <button
            onClick={() => {
              // @ts-ignore
              window.location.href = connect.state.link.replace(
                "ton://",
                "https://tonhub.com/"
              );
            }}
          >
            Open Tonhub Wallet{" "}
          </button>
        )}
        {!isMobile() && (
          <div>
            Scan with your mobile tonhub wallet:
            <br />
            <br />
            <QRCode value={connect.state.link} />
          </div>
        )}
      </div>
    );
  }
  return <></>;
}
