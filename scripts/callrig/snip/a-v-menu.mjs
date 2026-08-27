// Verify pass: open a participant's action menu and enumerate every interactive node it exposes.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const T = process.env.QA_TARGET||'QA Bob';
  const out={};
  out.click = await page.evaluate((t)=>{
    const row=[...document.querySelectorAll('[data-testid="participant-row"]')].find(r=>(r.innerText||'').includes(t));
    if(!row) return 'no row';
    const b=[...row.querySelectorAll('button')].find(x=>/action/i.test(x.getAttribute('aria-label')||''));
    if(!b) return 'no btn'; b.click(); return 'clicked';
  }, T);
  await page.waitForTimeout(2500);
  out.interactive = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button,[role="menuitem"],[role="option"],a,li[tabindex]')].filter(vis)
      .map(m=>((m.getAttribute('role')||m.tagName.toLowerCase())+' | '+(m.getAttribute('aria-label')||'')+' | '+(m.textContent||'').replace(/\s+/g,' ').trim().slice(0,42)))
      .slice(0,70);},VS);
  return out;
};
