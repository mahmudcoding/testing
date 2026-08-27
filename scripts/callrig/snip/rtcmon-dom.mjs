export default async ({page}) => await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t => ({
    local: t.getAttribute('data-local'),
    aria: t.getAttribute('aria-label'),
    text: (t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
    videos: t.querySelectorAll('video').length,
    audios: t.querySelectorAll('audio').length,
    attrs: [...t.attributes].map(a=>a.name+'='+String(a.value).slice(0,40))
  }));
  const media = [...document.querySelectorAll('video,audio')].map(el => ({
    tag: el.tagName,
    hasSrc: !!el.srcObject,
    tracks: el.srcObject ? el.srcObject.getTracks().map(t=>t.kind+':'+t.id.slice(0,8)) : [],
    inTile: !!el.closest('[data-testid="participant-tile"]'),
    tileLocal: el.closest('[data-testid="participant-tile"]')?.getAttribute('data-local') ?? null,
    testid: el.getAttribute('data-testid')
  }));
  // what senders exist, and are their tracks anywhere in the DOM?
  const pcs = window.__rtcStreamMonitor__ ? null : null;
  return { tiles, media, bodyHasName: /QA Alice/.test(document.body.innerText) };
});
