// Verify pass: host asks QA_TARGET to turn on camera, leaving the prompt for them to answer.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const T = process.env.QA_TARGET||'QA Bob';
  const out={target:T};
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="header-tab-main-activate"]'); if(b)b.click();});
  await page.waitForTimeout(3000);
  const listOpen = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!listOpen){ await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-people-toggle"]'); if(b)b.click();}); await page.waitForTimeout(2500); }
  out.opened = await page.evaluate((t)=>{
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const row=rows.find(r=>(r.innerText||'').includes(t));
    if(!row) return {err:'no row', rows:rows.map(r=>(r.innerText||'').replace(/\s+/g,' ').slice(0,24))};
    const b=[...row.querySelectorAll('button')].find(x=>/action/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no actions btn', btns:[...row.querySelectorAll('button')].map(x=>x.getAttribute('aria-label'))};
    b.click(); return {ok:true};
  }, T);
  await page.waitForTimeout(2000);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis)
      .map(m=>(m.textContent||'').replace(/\s+/g,' ').trim().slice(0,40));},VS);
  out.clicked = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis)
      .find(x=>/turn on camera/i.test(x.textContent||''));
    if(!m) return null; const t=(m.textContent||'').trim(); m.click(); return t;},VS);
  await page.waitForTimeout(3000);
  return out;
};
