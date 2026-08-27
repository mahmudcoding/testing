const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const NEW=process.env.D2_NAME||'QA Workspace D';
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/\/api\//.test(r.url())) return;
    let b=''; try{b=(await r.text()).slice(0,110);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('input')].filter(vis).filter(x=>x.type!=='search')[0];
    return i? i.value : null; })()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('input')].filter(vis).filter(x=>x.type!=='search')[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(i, ${JSON.stringify(NEW)}); i.dispatchEvent(new Event('input',{bubbles:true}));
    i.dispatchEvent(new Event('blur',{bubbles:true})); })()`);
  await page.waitForTimeout(1200);
  const saveState = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()))
      .map(b=>({t:(b.innerText||'').trim(), disabled:b.disabled===true})); })()`);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(b.length && !b[0].disabled) b[0].click(); })()`);
  await page.waitForTimeout(3500);
  const after = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:((j&&(j.workspaces||j.items))||[]);
    const w=a.find(x=>x.id==='W4QDF1XTURESO01');
    const railText=(document.querySelector('nav')||{innerText:''}).innerText.replace(/\\s+/g,' ').slice(0,60);
    return { apiName: w? w.name : null, railMentionsNew: /D2 renamed/.test(document.body.innerText) };})()`);
  return { before, saveState, requests:[...net].slice(0,3), after };
};
