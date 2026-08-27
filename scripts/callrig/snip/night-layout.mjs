export default async ({page}) => {
  return await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
      const r=t.getBoundingClientRect();
      const n=t.querySelector('[data-testid="participant-name"]');
      return {name: n?n.innerText.trim():'?', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};
    });
    const vt = document.querySelector('[data-testid="call-view-toggle"]');
    const fs = document.querySelector('[data-testid="call-surface-fullscreen"]');
    const mi = document.querySelector('[data-testid="call-surface-minimize"]');
    const film = document.querySelector('[data-testid="call-filmstrip"]');
    return {
      viewToggle: vt?{label:vt.getAttribute('aria-label'), pressed:vt.getAttribute('aria-pressed')}:null,
      fullscreenBtn: fs?{label:fs.getAttribute('aria-label'), pressed:fs.getAttribute('aria-pressed')}:null,
      minimizeBtn: mi?{label:mi.getAttribute('aria-label')}:null,
      filmstrip: !!film,
      tiles,
      docFullscreen: !!document.fullscreenElement,
      pagination: [...document.querySelectorAll('[data-testid*="pagination" i]')].map(e=>e.innerText.replace(/\n+/g,'/').slice(0,60))
    };
  });
};
