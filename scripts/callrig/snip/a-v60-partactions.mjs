const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  // click Participant actions on Bob's row
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const bob=rows.find(r=>/QA Bob/.test(r.innerText||'')&&!/\(you\)/.test(r.innerText||''));
    if(!bob) return null;
    const b=[...bob.querySelectorAll('button')].find(b=>/Participant actions/i.test(b.getAttribute('aria-label')||''));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};},VS);
  out.actionsBtn=pos;
  if(!pos) return out;
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(1800);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis)
      .map(x=>(x.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)).filter(Boolean))];},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/part-actions.png'});
  return out;
};
