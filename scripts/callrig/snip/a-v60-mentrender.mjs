const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // Mentions surface
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.mentionsView = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const rows=[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/V60-MENTION|V60\\\\-MENTION/.test(e.innerText||''))
      .map(e=>e.innerText.trim().slice(0,70));
    return { rows, hasBackslash:/\\\\/.test(m.innerText||''),
      raw:(m.innerText||'').replace(/\s+/g,' ').slice(0,220) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/mentions-raw.png'});
  // Channel surface, same message
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.channelView = await page.evaluate((vs)=>{const vis=eval(vs);
    const msgs=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    const last=msgs.filter(x=>/MENTION/i.test(x.innerText||'')).slice(-1)[0];
    return last?{ txt:(last.innerText||'').replace(/\s+/g,' ').slice(-60),
      hasBackslash:/\\/.test(last.innerText||'') }:null;},VS);
  return out;
};
