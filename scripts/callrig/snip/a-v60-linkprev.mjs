const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  // grab a permalink to an existing message via its Share action
  const id = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>/V60-COPY/.test(x.innerText||''));
    return m[m.length-1]?.getAttribute('data-message-id');},VS);
  out.targetId=id;
  if(!id) return out;
  // post a message containing a link to that message
  const link=`https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001?m=${id}`;
  const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await c.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type('V60-LINKPREV '+link,{delay:8});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/linkprev.png'});
  out.rendered = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).slice(-1)[0];
    if(!m) return null;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,220),
      links:[...m.querySelectorAll('a')].map(a=>({t:(a.innerText||'').trim().slice(0,40),href:(a.getAttribute('href')||'').slice(-30)})),
      hasPreviewCard: !!m.querySelector('[class*="preview"],[data-testid*="preview"]') };},VS);
  return out;
};
