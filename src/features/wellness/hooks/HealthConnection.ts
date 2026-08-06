import { useState } from "react";

export function useHealthConnection() {

  const [connected, setConnected] = useState(false);

  const [syncing, setSyncing] = useState(false);

  return {

    connected,

    syncing,

    setConnected,

    setSyncing,

  };

}