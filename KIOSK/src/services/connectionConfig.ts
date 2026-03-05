const LS_URL_KEY = "kiosk_pos_url";
const LS_ID_KEY = "kiosk_terminal_id";

export function getPosUrl(): string {
  return (
    localStorage.getItem(LS_URL_KEY) ??
    (import.meta.env.VITE_WS_URL as string | undefined) ??
    "ws://127.0.0.1:3001"
  );
}

export function getTerminalId(): string {
  return (
    localStorage.getItem(LS_ID_KEY) ??
    (import.meta.env.VITE_TERMINAL_ID as string | undefined) ??
    "KIOSK-1"
  );
}

export function saveConnectionConfig(url: string, id: string): void {
  localStorage.setItem(LS_URL_KEY, url.trim());
  localStorage.setItem(LS_ID_KEY, id.trim());
}
