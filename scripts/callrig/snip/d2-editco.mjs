const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const consoleMsgs=[]; page.on('console', m => { if(m.type()==='error'||m.type()==='warning') consoleMsgs.push(m.type()+': '+m.text().slice(0,120)); });
  const net=[]; page.on('request', r => { if(r.method()!=='GET') net.push(`${r.method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50)}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  // 1. describe the control and prove it is hittable
  const pre = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Edit company profile$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length};
    const el=b[0]; el.scrollIntoView({block:'center'});
    const r=el.getBoundingClientRect();
    const cx=Math.round(r.left+r.width/2), cy=Math.round(r.top+r.height/2);
    const hit=document.elementFromPoint(cx,cy);
    return { n:1, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      center:[cx,cy], hitIsSelfOrChild: !!hit && (hit===el||el.contains(hit)||hit.contains(el)),
      hitTag: hit?hit.tagName+'.'+(hit.className||'').toString().slice(0,30):null,
      attrs:{ type:el.getAttribute('type'), disabled:el.disabled,
              ariaExpanded:el.getAttribute('aria-expanded'), ariaHasPopup:el.getAttribute('aria-haspopup'),
              ariaControls:el.getAttribute('aria-controls'), form:el.getAttribute('form'),
              onclick: typeof el.onclick } }; })()`);
  if (pre.n!==1) return { err:'button not uniquely found', pre };
  // 2. poll for ANY change starting before the click
  const seen=[];
  const poll=setInterval(async()=>{ try{
    const s=await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).length;
      const t=[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(Boolean);
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Edit company profile$/.test((x.innerText||'').trim()))[0];
      return { d, t, url:location.pathname, exp:b?b.getAttribute('aria-expanded'):null,
               bodyLen:(document.body.innerText||'').length }; })()`);
    seen.push(s); }catch{} }, 300);
  await page.waitForTimeout(600);
  net.length=0; consoleMsgs.length=0;
  // 3. real user-style click through Playwright (hit-tests, throws if not actionable)
  let clickErr=null;
  try { await page.locator('button', { hasText: /^Edit company profile$/ }).first().click({ timeout: 5000 }); }
  catch(e){ clickErr = String(e).slice(0,140); }
  await page.waitForTimeout(4000);
  clearInterval(poll);
  const post = await page.evaluate(`(() => { const vis=(${VIS});
    return { dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length,
      url:location.pathname,
      inputs:[...document.querySelectorAll('input')].filter(vis).length,
      bodyLen:(document.body.innerText||'').length }; })()`);
  const bodyLens=[...new Set(seen.map(s=>s.bodyLen))];
  return { pre, clickErr, post,
    samples:seen.length, dialogsEverSeen:[...new Set(seen.map(s=>s.d))],
    toastsEver:[...new Set(seen.flatMap(s=>s.t))], urlsEver:[...new Set(seen.map(s=>s.url))],
    ariaExpandedEver:[...new Set(seen.map(s=>s.exp))], bodyLensEver:bodyLens,
    nonGetRequests:net, consoleErrors:consoleMsgs.slice(0,6) };
};
