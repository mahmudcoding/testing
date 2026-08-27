export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const vfn = `el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const base = await page.evaluate((v)=>{ const vis=eval(v); const main=document.querySelector('main')||document.body;
    return {url:location.href, tabs:[...main.querySelectorAll('[role=tab],button')].filter(vis).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,32), sel:b.getAttribute('aria-selected'), tid:b.getAttribute('data-testid')||undefined})).filter(x=>x.t).slice(0,24),
            text:(main.innerText||'').replace(/\n+/g,' | ').slice(0,600)}; }, vfn);
  // click Logs tab
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('[role=tab],button')].filter(vis).find(x=>/^logs?$/i.test((x.innerText||'').trim()));
    if(b){b.click(); return true;} return false; }, vfn);
  await page.waitForTimeout(4000);
  const logs = await page.evaluate((v)=>{ const vis=eval(v); const main=document.querySelector('main')||document.body;
    return {text:(main.innerText||'').replace(/\n+/g,' | ').slice(0,1400),
            btns:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,20)}; }, vfn);
  return {base, logsTabClicked: clicked, logs};
};
