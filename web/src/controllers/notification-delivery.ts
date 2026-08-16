import type { NotificationPreferences } from "../models/settings";
import type { NotificationRecord, NotificationSettings } from "./notification-types";

export interface NotificationDeliveryDependencies {
  settings(): NotificationSettings;
  updateSettings(settings: NotificationSettings): void;
  settingsChanged(): void;
  claim(record: NotificationRecord, kind: "browser" | "sound", action: () => void): void;
  navigate(record: NotificationRecord): Promise<void>;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window.Notification === "undefined") return "unsupported";
  const permission = String(window.Notification.permission || "default");
  return permission === "granted" || permission === "denied" ? permission : "default";
}

export function notificationDisplayTitle(record: NotificationRecord): string {
  const kind = record.resourceType === "project" ? "Project" : record.resourceType === "task" ? "Task" : "Session";
  return `${kind}: ${record.title || record.resourceId || record.generationId}`;
}

export function notificationDisplayBody(record: NotificationRecord): string {
  if (record.completionState === "failed") return "Turn failed.";
  if (record.completionState === "cancelled") return "Turn cancelled.";
  return "Turn completed.";
}

export function createNotificationDelivery(dependencies: NotificationDeliveryDependencies) {
  let audioContext: AudioContext | null = null;
  let soundError = "";
  let permissionError = "";

  function playSound(): void {
    if (!dependencies.settings().sound) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioContext !== "function") {
      soundError = "Audio is unavailable in this browser.";
      dependencies.settingsChanged();
      return;
    }
    try {
      const audio = audioContext || new AudioContext();
      audioContext = audio;
      const start = () => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audio.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, audio.currentTime + .12);
        gain.gain.setValueAtTime(1e-4, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + .01);
        gain.gain.exponentialRampToValueAtTime(1e-4, audio.currentTime + .16);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + .18);
      };
      if (audio.state === "suspended") void audio.resume().then(start).catch((error) => {
        soundError = "Chrome blocked completion sound until audio is enabled by the page.";
        console.warn("completion sound unavailable", error);
        dependencies.settingsChanged();
      });
      else start();
    } catch (error) {
      soundError = "Completion sound is unavailable right now.";
      console.warn("completion sound unavailable", error);
      dependencies.settingsChanged();
    }
  }

  function sendBrowser(record: NotificationRecord): void {
    if (!dependencies.settings().browser || notificationPermission() !== "granted") return;
    try {
      const notification = new window.Notification(notificationDisplayTitle(record), { body: notificationDisplayBody(record), tag: `pua-${record.marker}`, icon: "/favicon.svg" });
      notification.onclick = () => {
        try { window.focus(); } catch (_) {}
        void dependencies.navigate(record).catch((error) => console.warn("notification navigation failed", error));
      };
    } catch (error) {
      console.warn("browser notification unavailable", error);
    }
  }

  function deliver(record: NotificationRecord): void {
    const settings = dependencies.settings();
    if (settings.browser && notificationPermission() === "granted") dependencies.claim(record, "browser", () => sendBrowser(record));
    if (settings.sound) dependencies.claim(record, "sound", playSound);
  }

  async function requestBrowser(): Promise<NotificationPermission | "unsupported"> {
    const settings = dependencies.settings();
    const permission = notificationPermission();
    if (permission === "unsupported") {
      dependencies.updateSettings({ ...settings, browser: false });
      permissionError = "Browser notifications are not supported here.";
      dependencies.settingsChanged();
      return permission;
    }
    if (permission === "denied") {
      dependencies.updateSettings({ ...settings, browser: false });
      permissionError = "Chrome denied permission. Restore it in Chrome site settings; PUA will not ask again automatically.";
      dependencies.settingsChanged();
      return permission;
    }
    let next: NotificationPermission = permission;
    if (permission === "default") try { next = await window.Notification.requestPermission(); }
    catch (error) {
      permissionError = "Chrome could not request notification permission.";
      console.warn("notification permission request failed", error);
    }
    dependencies.updateSettings({ ...settings, browser: next === "granted" });
    permissionError = next === "granted" ? "" : next === "denied"
      ? "Chrome denied permission. Restore it in Chrome site settings; PUA will not ask again automatically."
      : "Notification permission is still pending.";
    dependencies.settingsChanged();
    return next;
  }

  function setBrowserEnabled(enabled: boolean): void {
    const settings = dependencies.settings();
    if (!enabled) {
      dependencies.updateSettings({ ...settings, browser: false });
      permissionError = "";
      dependencies.settingsChanged();
      return;
    }
    void requestBrowser().catch((error) => {
      dependencies.updateSettings({ ...dependencies.settings(), browser: false });
      permissionError = "Chrome could not request notification permission.";
      console.warn("notification permission request failed", error);
      dependencies.settingsChanged();
    });
  }

  async function initializeAudio(): Promise<boolean> {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioContext !== "function") {
      soundError = "Audio is unavailable in this browser.";
      dependencies.settingsChanged();
      return false;
    }
    try {
      audioContext ||= new AudioContext();
      await audioContext.resume?.();
      soundError = "";
      dependencies.settingsChanged();
      return true;
    } catch (error) {
      soundError = "Chrome may block sound until the page receives an audio gesture.";
      console.warn("completion audio initialization failed", error);
      dependencies.settingsChanged();
      return false;
    }
  }

  function setSoundEnabled(enabled: boolean): void {
    dependencies.updateSettings({ ...dependencies.settings(), sound: enabled });
    soundError = "";
    dependencies.settingsChanged();
    if (enabled) void initializeAudio();
  }

  function preferences(): NotificationPreferences {
    const settings = dependencies.settings();
    return { ...settings, permission: notificationPermission(), permissionError, soundError };
  }

  function dispose(): void {
    try { void audioContext?.close(); } catch (_) {}
    audioContext = null;
  }

  return { deliver, dispose, preferences, setBrowserEnabled, setSoundEnabled };
}
