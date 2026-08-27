export default async ({page}) => {
  // ensure grid view
  const vt=page.locator('[data-testid="call-view-toggle"]');
  if (await vt.getAttribute('aria-pressed')==='true'){ await vt.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
      const n=t.querySelector('[data-testid="participant-name"]'); const r=t.getBoundingClientRect();
      return {name:n?n.innerText.trim():'?', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};
    });
    const pag=[...document.querySelectorAll('[data-testid*="pagination" i],[data-testid*="page" i]')].map(e=>({t:e.getAttribute('data-testid'), txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,60)}));
    const grid=document.querySelector('[data-testid="participant-grid"]');
    return {count: tiles.length, tiles, pagination: pag,
      gridStyle: grid?{cols:getComputedStyle(grid).gridTemplateColumns, rows:getComputedStyle(grid).gridTemplateRows}:null,
      viewToggle:(v=>v?{l:v.getAttribute('aria-label'),p:v.getAttribute('aria-pressed')}:null)(document.querySelector('[data-testid="call-view-toggle"]'))};
  });
};
