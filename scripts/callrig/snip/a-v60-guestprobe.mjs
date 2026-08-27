const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(5000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-long.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    // ALK-2900: the long meeting title must wrap, not overflow or push controls off-screen
    const titleEl=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /Quarterly Planning/.test(e.innerText||''))[0];
    const t = titleEl?titleEl.getBoundingClientRect():null;
    const cs = titleEl?getComputedStyle(titleEl):null;
    return {
      url:location.pathname.slice(0,40),
      title: titleEl? { text:(titleEl.innerText||'').replace(/\s+/g,' ').slice(0,80),
        clipped: titleEl.scrollWidth > titleEl.clientWidth+1,
        scrollW:titleEl.scrollWidth, clientW:titleEl.clientWidth,
        rectRight:Math.round(t.right), innerW:innerWidth, offScreen:t.right>innerWidth,
        whiteSpace:cs.whiteSpace, overflow:cs.overflow, textOverflow:cs.textOverflow,
        lines:Math.round(t.height/parseFloat(cs.lineHeight||'20')) } : null,
      docScrollW:document.documentElement.scrollWidth,
      pageOverflows:document.documentElement.scrollWidth>innerWidth,
      offScreenButtons:[...document.querySelectorAll('button')].filter(vis)
        .filter(b=>b.getBoundingClientRect().left>=innerWidth).map(b=>(b.getAttribute('aria-label')||'').slice(0,22)),
      // ALK-3028/3037: what policy/flags is the guest told about?
      policyText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && /not allowed|permission|request|policy|host/i.test(e.innerText||''))
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,54)).slice(0,5),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,22)).filter(Boolean) };},VS);
};
