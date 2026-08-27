const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)){ let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,50),s:r.status(),res:b});}});
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { panel:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      banner:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/side room|main room|back to main|you.re in/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,5) };},VS);
  out.before = await read();
  await page.locator('button', { hasText: /^Join$/ }).first().click();
  const poll=[]; for(let i=0;i<12;i++){ poll.push({t:i*600,...(await read())}); await page.waitForTimeout(600); }
  out.after = poll[poll.length-1];
  out.requests = net;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/bob-in-room.png'});
  return out;
};
