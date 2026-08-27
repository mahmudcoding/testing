// Verify pass: open a participant's action menu with a real pointer click.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const T = process.env.QA_TARGET||'QA Bob';
  const out={};
  const row = page.locator('[data-testid="participant-row"]').filter({hasText:T}).first();
  out.rowCount = await row.count();
  out.rowText = out.rowCount ? (await row.innerText()).replace(/\s+/g,' ').slice(0,40) : null;
  const btn = row.locator('button[aria-label="Participant actions"]').first();
  await btn.click();
  await page.waitForTimeout(1800);
  out.interactive = await page.evaluate((vs)=>{const vis=eval(vs);
    // only nodes that sit above the panel — portal/menu content
    return [...document.querySelectorAll('button,[role="menuitem"],[role="option"]')].filter(vis)
      .filter(m=>{const z=m.closest('[data-radix-popper-content-wrapper],[role="menu"],[data-testid*="menu"]'); return !!z;})
      .map(m=>(m.textContent||'').replace(/\s+/g,' ').trim().slice(0,44));},VS);
  if(!out.interactive.length){
    out.fallbackAll = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis)
        .map(m=>(m.textContent||'').replace(/\s+/g,' ').trim())
        .filter(t=>/pin|watch|co-host|permission|remove|ban|mute|camera|tile|move/i.test(t)).slice(0,20);},VS);
  }
  const clicked = await page.locator('button, [role="menuitem"]').filter({hasText:/turn on camera/i}).first();
  if(await clicked.count()){ out.clickedLabel=(await clicked.innerText()).trim(); await clicked.click(); await page.waitForTimeout(2500); }
  return out;
};
