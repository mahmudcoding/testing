const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/files/i.test(u)){ let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,60),s:r.status(),res:b});}});
  await page.locator('button', { hasText: /^Shared with me$/ }).first().click().catch(e=>out.err=String(e).slice(0,50));
  await page.waitForTimeout(4500);
  out.requests = net.filter(n=>n.u);
  out.view = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { hasFile:/v60-upload/i.test(m.innerText||''), txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,300) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/bob-shared.png'});
  return out;
};
