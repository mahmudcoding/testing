const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  // channel header actions
  out.header = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { btns:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean).slice(0,16),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,140) };},VS);
  // open Members
  const mb = page.locator('button',{hasText:/^Members/}).first();
  out.membersFound = await mb.count()>0;
  if(out.membersFound){ await mb.click(); await page.waitForTimeout(3000); }
  out.membersPanel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean).slice(0,16) };},VS);
  // per-member actions: hover a member row
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    const el=[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^QA Bob$/.test((e.innerText||'').trim()))[0];
    if(!el) return null; const r=el.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  if(pos){ await page.mouse.move(pos.x,pos.y); await page.waitForTimeout(1400);
    out.memberActions = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,32)).filter(a=>/mute|remove|role|profile|actions|admin/i.test(a)).slice(0,8);},VS); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/chan-members.png'});
  return out;
};
