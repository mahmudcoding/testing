export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,55), body:(r.postData()||'').slice(0,60)}); };
  page.on('request', onReq);
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const read=()=>page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'),
      expanded:b&&b.getAttribute('aria-expanded'),
      ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,120)};}, sel);
  out.before=await read();
  await page.locator(sel).first().click();
  await page.waitForTimeout(700);
  const item=page.locator('*').filter({hasText:/^For 1 hour$/}).last();
  out.itemFound=await item.count();
  await item.click();
  await page.waitForTimeout(1800);
  page.off('request', onReq);
  out.afterPick=await read();
  await page.reload(); await page.waitForTimeout(3500);
  out.afterReload=await read();
  return out;
};
