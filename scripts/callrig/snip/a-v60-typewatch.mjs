const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  // open call chat and watch for a typing indicator
  const open = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return d? /Message everyone|Call chat|Chat ·/.test(d.innerText||'') : false;},VS);
  if(!open){ await page.locator('button[aria-label="Call chat"]').first().click().catch(()=>{}); await page.waitForTimeout(2800); }
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return { typing:/typing|печат/i.test(t) ? (t.match(/[^.]{0,40}(typing|печат)[^.]{0,20}/i)||[''])[0] : null,
      tail:t.slice(-70) };},VS);
  const samples=[]; for(let i=0;i<40;i++){ samples.push(await read()); await page.waitForTimeout(500); }
  return { anyTyping:[...new Set(samples.map(s=>s.typing).filter(Boolean))], lastTail:samples[samples.length-1].tail };
};
