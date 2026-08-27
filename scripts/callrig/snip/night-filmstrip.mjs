export default async ({page}) => {
  return await page.evaluate(()=>{
    const fs=document.querySelector('[data-testid="call-filmstrip"]');
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
      const n=t.querySelector('[data-testid="participant-name"]'); const r=t.getBoundingClientRect();
      return {name:n?n.innerText.trim():'?', w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x)};
    });
    const pag=[...document.querySelectorAll('[data-testid*="pagination" i],[data-testid*="filmstrip" i]')].map(e=>({t:e.getAttribute('data-testid'), txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,60),
      scrollW: e.scrollWidth, clientW: e.clientWidth}));
    return {filmstripPresent: !!fs, tiles, related: pag};
  });
};
