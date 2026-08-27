const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const BS = String.fromCharCode(92);
export default async ({ page }) => {
  const out={};
  const grab = (label) => page.evaluate(([vs,bs])=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const txt=(m.innerText||'').replace(/\s+/g,' ');
    return { escaped: txt.includes(bs), sample: txt.slice(0,240) };},[VS,BS]);
  // 1) Mentions
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500); out.mentions = await grab();
  // 2) Saved messages
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000); out.saved = await grab();
  // 3) sidebar DM/channel previews + bell
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.sidebarAndBell = await page.evaluate(([vs,bs])=>{const vis=eval(vs);
    const side=document.querySelector('[data-testid="chat-sidebar-slot"]')||document.body;
    return { sidebarEscaped:(side.innerText||'').includes(bs), sidebarSample:(side.innerText||'').replace(/\s+/g,' ').slice(0,160) };},[VS,BS]);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  if(await bell.count()){ await bell.click(); await page.waitForTimeout(3000);
    out.bell = await page.evaluate(([vs,bs])=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],aside,[role="menu"]')].filter(vis).pop()||document.body;
      const t=(d.innerText||'').replace(/\s+/g,' ');
      return { escaped:t.includes(bs), sample:t.slice(0,220) };},[VS,BS]); }
  return out;
};
