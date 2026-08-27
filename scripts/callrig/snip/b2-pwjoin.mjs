export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING, PW=process.env.QA_PWTRY||'wrong-pass';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  out.gate = await page.evaluate((v)=>{ const vis=eval(v);
    return {txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,350),
      inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>({type:i.type, ph:i.placeholder, al:i.getAttribute('aria-label')})),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), dis:b.disabled||undefined}))}; }, V);
  const pw = await page.$('input[type=password]');
  if (pw) { await pw.fill(PW); await page.waitForTimeout(500); }
  out.filled = !!pw;
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join call|Continue|Submit|Enter)$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled) b.click(); }, V);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400),
      toasts:[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean))],
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,16)}; }, V);
  return out;
};
