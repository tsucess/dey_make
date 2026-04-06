const agoraRtcScriptUrl = "https://cdn.jsdelivr.net/npm/agora-rtc-sdk-ng@4.24.3/AgoraRTC_N-production.js";

let agoraRtcLoaderPromise = null;

export async function loadAgoraRtc() {
  if (typeof window === "undefined") {
    throw new Error("Agora RTC can only be loaded in the browser.");
  }

  if (window.AgoraRTC) {
    return window.AgoraRTC;
  }

  if (!agoraRtcLoaderPromise) {
    agoraRtcLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-agora-rtc-loader="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.AgoraRTC), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Agora RTC.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = agoraRtcScriptUrl;
      script.async = true;
      script.dataset.agoraRtcLoader = "true";
      script.onload = () => {
        if (window.AgoraRTC) {
          resolve(window.AgoraRTC);
          return;
        }

        reject(new Error("Agora RTC loaded without exposing the global API."));
      };
      script.onerror = () => reject(new Error("Failed to load Agora RTC."));
      document.head.appendChild(script);
    }).catch((error) => {
      agoraRtcLoaderPromise = null;
      throw error;
    });
  }

  return agoraRtcLoaderPromise;
}