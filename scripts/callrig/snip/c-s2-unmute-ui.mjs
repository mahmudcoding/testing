export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)); };
  page.on('request', onReq);
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const exp=await page.evaluate((s)=>document.querySelector(s).getAttribute('aria-expanded'), sel);
  if (exp!=='true'){ await page.locator(sel).first().click(); await page.waitForTimeout(800); }
  const btn=page.locator('[data-radix-popper-content-wrapper] button').filter({hasText:'Unmute'}).first();
  out.found=await btn.count();
  if (out.found){ await btn.click(); await page.waitForTimeout(1800); }
  page.off('request', onReq);
  out.after=await page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'),
      ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,90)};}, sel);
  return out;
};
