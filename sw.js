// Zeca: service worker (avisos de mensagem). 21/09/2026.
const VERSAO = "prosa-v4";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "Zeca", body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    const ios = /iphone|ipad|ipod/i.test(self.navigator.userAgent);
    const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const vendo = janelas.some(c => c.visibilityState === "visible" && d.tag && c.url.includes(d.tag));
    if (vendo && !ios) return;
    let padrao = [120, 60, 120];
    try { const c = await caches.open("prosa-prefs"); const r = await c.match("prefs.json"); if (r) { const p = await r.json(); if (Array.isArray(p.padrao)) padrao = p.padrao; } } catch (x) {}
    await self.registration.showNotification(d.title || "Prosa", {
      body: d.body || "Nova mensagem", tag: d.tag || "zeca", renotify: true,
      icon: "icon-192.png", badge: "badge-72.png", data: { url: d.url || "./" }, vibrate: padrao
    });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of janelas) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        const m = url.match(/c=([0-9a-f-]{36})/);
        if (m) c.postMessage({ abrir: m[1] });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
