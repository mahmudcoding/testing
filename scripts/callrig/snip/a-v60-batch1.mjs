const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // --- ALK-3085: profile preview stays focused while a quick status saves
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const before = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { scrollTop:Math.round(m.scrollTop), active:(document.activeElement?.tagName||'')+':'+(document.activeElement?.getAttribute('aria-label')||'').slice(0,20),
      quick:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,22)).filter(t=>/🚇|🤒|🌴|🏠|🍔|👤/.test(t)) };},VS);
  out.quickStatusBefore = before;
  const st = page.locator('button', { hasText: /Commuting/ }).first();
  if(await st.count()){
    await st.click();
    const poll=[]; for(let i=0;i<10;i++){ poll.push(await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      return { scrollTop:Math.round(m.scrollTop),
        toast:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').trim().slice(0,30)).filter(Boolean)[0]||null,
        pressed:[...m.querySelectorAll('button')].filter(vis).filter(b=>/Commuting/.test(b.innerText||'')).map(b=>b.getAttribute('aria-pressed'))[0]||null };},VS)); await page.waitForTimeout(500); }
    out.quickStatusAfter = { last:poll[poll.length-1], scrollTops:[...new Set(poll.map(p=>p.scrollTop))],
      toastSeen:poll.find(p=>p.toast)?.toast||null };
  }
  // --- ALK-2480 / ALK-2542: Saved Messages and People search are scoped
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  out.savedSurface = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,140),
      searchInputs:[...m.querySelectorAll('input')].filter(vis).map(i=>(i.placeholder||'').slice(0,30)) };},VS);
  return out;
};
