import { MockInterviewSession } from "./types";

const SESSIONS_STORAGE_KEY = "gtm_interview_studio_sessions_v1";
const ACTIVE_SESSION_STORAGE_KEY = "gtm_interview_active_session_v1";

export function loadSavedSessions(): MockInterviewSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load sessions from localStorage", e);
    return [];
  }
}

export function saveSession(session: MockInterviewSession): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSavedSessions();
    const index = existing.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      existing[index] = session;
    } else {
      existing.unshift(session);
    }
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event('gtm-storage-sync'));
  } catch (e) {
    console.error("Failed to save session", e);
  }
}

export function deleteSession(sessionId: string): MockInterviewSession[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = loadSavedSessions();
    const filtered = existing.filter((s) => s.id !== sessionId);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('gtm-storage-sync'));
    return filtered;
  } catch (e) {
    console.error("Failed to delete session", e);
    return [];
  }
}

export function exportSessionsAsJSON(): string {
  const sessions = loadSavedSessions();
  return JSON.stringify(sessions, null, 2);
}

export function importSessionsFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new Event('gtm-storage-sync'));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to import sessions", e);
    return false;
  }
}
