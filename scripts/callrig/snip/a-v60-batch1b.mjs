const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.quickButtons = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24))
      .filter(t=>/meeting|Commuting|Sick|Vacation|remotely|Lunch/i.test(t));},VS);
  const st = page.locator('button', { hasText: /Commuting/ }).first();
  out.found = await st.count()>0;
  if(out.found){
    const scroller = await page.evaluate(()=>{
      const el=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+30).sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];
      return el?{sh:el.scrollHeight,ch:el.clientHeight,top:Math.round(el.scrollTop)}:null;});
    out.scrollerBefore=scroller;
    await st.click();
    const poll=[];
    for(let i=0;i<10;i++){ poll.push(await page.evaluate((vs)=>{const vis=eval(vs);
      const el=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+30).sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];
      const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/Commuting/.test(b.innerText||''));
      return { top: el?Math.round(el.scrollTop):null, pressed:b?b.getAttribute('aria-pressed'):null,
        toast:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').trim().slice(0,26)).filter(Boolean)[0]||null,
        activeTag:document.activeElement?.tagName||null };},VS)); await page.waitForTimeout(500); }
    out.scrollTops=[...new Set(poll.map(p=>p.top))];
    out.pressedSeq=[...new Set(poll.map(p=>p.pressed))];
    out.toast=poll.find(p=>p.toast)?.toast||null;
    out.activeTags=[...new Set(poll.map(p=>p.activeTag))];
  }
  return out;
};
