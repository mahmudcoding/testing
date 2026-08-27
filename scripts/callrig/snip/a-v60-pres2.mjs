const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const raw = await page.evaluate(async () => {
    const r = await fetch('/api/v1/workspaces/W4QAF1XTURESO01/presence',{credentials:'include'});
    return { s:r.status, body:(await r.text()).slice(0,600) };
  });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/bob-people.png'});
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const rows=[...main.querySelectorAll('*')].filter(e=>vis(e)&&/QA (Alice|Bob|Carol|Owner|Admin|Dave|Guest)/.test(e.innerText||'')&&e.children.length<=6);
    const seen=new Set(); const out=[];
    for(const r of rows){ const t=(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,70); if(seen.has(t)||t.length>70)continue; seen.add(t);
      // presence dot: small round element with a background colour
      const dots=[...r.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect(); const cs=getComputedStyle(d);
        return vis(d)&&b.width<=16&&b.height<=16&&b.width>3&&parseFloat(cs.borderRadius)>=4&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';})
        .map(d=>getComputedStyle(d).backgroundColor);
      out.push({t, dots:dots.slice(0,3)}); }
    return out.slice(0,12);},VS);
  return { rawPresence: raw, peopleRows: ui };
};
