const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const info = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>(x.innerText||'').trim().length>20);
    const last=m[m.length-1];
    return { count:m.length, id:last?.getAttribute('data-message-id'), txt:(last?.innerText||'').replace(/\s+/g,' ').slice(-50) };},VS);
  out.target=info;
  if(!info.id) return out;
  const link=`https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001?m=${info.id}`;
  const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await c.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type('V60-LINKPREV '+link,{delay:6});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/linkprev2.png'});
  out.rendered = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).slice(-1)[0];
    if(!m) return null;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,260),
      links:[...m.querySelectorAll('a')].map(a=>({t:(a.innerText||'').trim().slice(0,44),href:(a.getAttribute('href')||'').slice(-34)})),
      innerBlocks:[...m.querySelectorAll('div')].filter(vis).length };},VS);
  return out;
};
