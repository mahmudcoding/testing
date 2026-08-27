const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,52); }`;
export default async ({ page }) => {
  const out={};
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/role/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,'').slice(0,44), s:r.status(), body:b }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  // what does the SERVER say to a duplicate name?
  out.serverDirect = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const r=await fetch(`/api/v1/companies/${CO}/roles`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:'Member', permissions:[`company.${CO}.member.view`]})});
    return { s:r.status, body:(await r.text()).slice(0,220) }; });
  // now do the same through the UI and see what the user is told
  const inputs = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    return [...document.querySelectorAll('main input')].filter(vis).map((e,i)=>({i,label:lbl(e)})); })()`);
  const ni = inputs.findIndex(x=>/Role name/i.test(x.label));
  const el = (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis)[${ni}]; })()`)).asElement();
  await el.scrollIntoViewIfNeeded(); await el.fill('Member'); await page.waitForTimeout(400);
  const pi = inputs.findIndex(x=>/View company members/i.test(x.label));
  const pel = (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis)[${pi}]; })()`)).asElement();
  await pel.scrollIntoViewIfNeeded();
  if (!(await pel.evaluate(e=>e.checked===true))) { await pel.click(); await page.waitForTimeout(500); }
  let notices=[], inline=[];
  const poll=setInterval(async()=>{ try{
    const n=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`);
    if(n.length>notices.length) notices=n;
    const l=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.innerText||'').trim())
        .filter(t=>/error|failed|could not|try again|exists|taken|already|unable/i.test(t)); })()`);
    if(l.length>inline.length) inline=l;
  }catch{} },250);
  net.length=0;
  const btn = page.locator('main button').filter({hasText:/^Create role$/}).first();
  if (await btn.count()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(6000); }
  clearInterval(poll);
  out.uiRequests = net.map(n=>`${n.m} ${n.u} -> ${n.s} ${n.body.slice(0,150)}`);
  out.toasts = notices; out.inline = inline;
  return out;
};
