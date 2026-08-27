const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onResp = async r => { const m=r.request().method();
    if(m==='GET'||!/notifications\/settings/.test(r.url())) return;
    let body=''; try{ body=r.request().postData()||''; }catch{}
    let resp=''; try{ resp=(await r.text()).slice(0,180);}catch{}
    net.push({ method:m, sent:body.slice(0,120), status:r.status(), got:resp }); };
  page.on('response', onResp);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  // toggle In-app notifications off through the UI
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const sw=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(s=>{
      let n=s,l=''; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t&&t.length<130){l=t;break;} }
      return /In-app notifications/i.test(l); });
    if(sw.length!==1) return {n:sw.length}; sw[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(1500);
  const saved = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(4000);
  const after = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return await r.text();})()`);
  page.off('response', onResp);
  return { clicked, saved, requestsFromTheScreen: net, settingsAfter: after };
};
