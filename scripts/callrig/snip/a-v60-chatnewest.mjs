const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // open call chat and post enough messages to overflow the panel
  await page.locator('button[aria-label="Call chat"]').first().click().catch(e=>out.e=String(e).slice(0,40));
  await page.waitForTimeout(2800);
  const ta = await page.$('textarea');
  if(!ta) return {...out, noComposer:true};
  for(let i=1;i<=14;i++){
    await ta.click(); await page.keyboard.type('line-'+i,{delay:6}); await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(3000);
  const scrollState = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    if(!d) return null;
    // the scrollable message list inside the chat panel
    const sc=[...d.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20)
      .sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];
    if(!sc) return {noScroller:true, txtTail:(d.innerText||'').replace(/\s+/g,' ').slice(-70)};
    return { scrollTop:Math.round(sc.scrollTop), scrollHeight:sc.scrollHeight, clientHeight:sc.clientHeight,
      atBottom: sc.scrollHeight-sc.scrollTop-sc.clientHeight < 40,
      txtTail:(sc.innerText||'').replace(/\s+/g,' ').slice(-60) };},VS);
  out.afterPosting = await scrollState();
  // close and reopen the chat — it should land on the newest message
  await page.locator('button[aria-label="Close chat"], button[aria-label="Close"]').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  await page.locator('button[aria-label="Call chat"]').first().click().catch(()=>{});
  await page.waitForTimeout(3500);
  out.afterReopen = await scrollState();
  return out;
};
