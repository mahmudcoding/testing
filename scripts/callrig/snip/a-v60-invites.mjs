const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/invites.png'});
  out.page = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,420),
      btns:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean).slice(0,16),
      tables:[...m.querySelectorAll('tr')].filter(vis).slice(0,5).map(r=>[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))) };},VS);
  // open the invite creation flow
  for(const l of [/^Create invite/i,/^New invite/i,/^Invite/i,/^Add invite/i]){
    const b=page.locator('button').filter({hasText:l}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.opened=String(l); await page.waitForTimeout(2800); break; }
  }
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,360),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,14),
      combos:[...d.querySelectorAll('[role="combobox"],select,button[aria-haspopup]')].filter(vis).map(c=>(c.innerText||'').replace(/\s+/g,' ').slice(0,30)),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,24)})) };},VS);
  return out;
};
