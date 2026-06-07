if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/shared/sw.js", { scope: "/" }).catch(() => {
      // PWA install support is optional; the app still runs without service worker.
    });
  });
}
