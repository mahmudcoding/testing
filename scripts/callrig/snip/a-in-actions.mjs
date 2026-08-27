export default async ({page}) => {
  const IDX = Number(process.env.QA_IDX||1);   // 0=alice 1=bob 2=carol
  const FROM = process.env.QA_FROM||'panel';   // panel | tile
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const opened = await page.evaluate(({IDX,FROM})=>{
    const root = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    let btns;
    if (FROM==='tile') btns=[...root.querySelectorAll('[data-testid="participant-tile-card-trigger"]')];
    else {
      const panel=[...root.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
      btns=panel?[...panel.querySelectorAll('button')].filter(b=>/participant actions/i.test(b.getAttribute('aria-label')||'')):[];
    }
    const b=btns[IDX]; if(!b) return {err:'no trigger', n:btns.length};
    b.click();
    return {clicked:b.getAttribute('aria-label'), n:btns.length};
  },{IDX,FROM});
  await page.waitForTimeout(1600);
  const menu = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(e=>e.getClientRects().length);
    const pick=m[m.length-1];
    if(!pick) return {err:'no menu'};
    return {tid:pick.getAttribute('data-testid'),
      items:[...pick.querySelectorAll('[role="menuitem"],[role="menuitemcheckbox"],button')].filter(e=>e.getClientRects().length)
        .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)+(e.getAttribute('aria-disabled')==='true'||e.disabled?' [disabled]':'')).filter(Boolean).slice(0,25),
      text:(pick.innerText||'').replace(/\n+/g,' | ').slice(0,400)};
  });
  return {opened, menu};
};
