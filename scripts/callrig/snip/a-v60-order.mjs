const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const order = () => page.evaluate((vs)=>{const vis=eval(vs);
    const s=document.querySelector('[data-testid="chat-sidebar-slot"]')||document.body;
    return [...s.querySelectorAll('a[href*="/d/"]')].filter(vis).map(a=>(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,14));},VS);
  // DMs are ordered by activity; post into the DM that is currently LAST
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.before = await order();
  if(out.before.length<2) return {...out, note:'need >=2 DMs'};
  const lastName = out.before[out.before.length-1];
  out.target = lastName;
  // open that DM and send a message
  const link = await page.evaluate((vs)=>{const vis=eval(vs);
    const s=document.querySelector('[data-testid="chat-sidebar-slot"]')||document.body;
    const as=[...s.querySelectorAll('a[href*="/d/"]')].filter(vis);
    const a=as[as.length-1]; return a?a.getAttribute('href'):null;},VS);
  out.href=link;
  if(!link) return out;
  await page.goto('https://airion-cargo.store'+link,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  if(c){ await c.click(); await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
    await page.keyboard.type('V60-ORDER-'+Math.floor(Date.now()/1000%100000),{delay:10}); await page.keyboard.press('Enter'); }
  const poll=[]; for(let i=0;i<12;i++){ poll.push(await order()); await page.waitForTimeout(800); }
  out.after = poll[poll.length-1];
  out.movedToTop = out.after[0]===lastName;
  out.orderChanged = JSON.stringify(out.before)!==JSON.stringify(out.after);
  return out;
};
