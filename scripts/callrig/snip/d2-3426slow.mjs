const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, ctx }) => {
  const W='W4QDF1XTURESO01';
  const cdp = await ctx.newCDPSession(page);
  const net=[];
  page.on('response', r => { const m=r.request().method();
    if(m!=='GET' && /auth\/me/.test(r.url())) net.push(`${m} -> ${r.status()}`); });
  const panel = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return /unsaved change/i.test(t); })()`;
  let out={};
  try {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline:false, latency:1200, downloadThroughput: 60*1024/8, uploadThroughput: 30*1024/8 });
    await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(i=>i.type!=='search');
      const t=ins.find(i=>!/QA /.test(i.value))||ins[1]||ins[0];
      const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      s.call(t,'D2 slow probe'); t.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(1500);
    out.dirtyBefore = await page.evaluate(panel);
    net.length=0;
    await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save profile$/i.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    const samples=[]; const t0=Date.now();
    while (Date.now()-t0 < 20000) {
      samples.push((await page.evaluate(panel))?1:0);
      await page.waitForTimeout(200);
    }
    out.sequence = samples.join('');
    out.reappeared = /1+0+1/.test(out.sequence);
    out.requests = [...net];
    out.transitions = out.sequence.replace(/(.)\1+/g,'$1');
  } finally {
    try { await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1}); } catch {}
    try { await cdp.detach(); } catch {}
  }
  return out;
};
