export default async ({page}) => {
  const out={};
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const snap=()=>page.evaluate(()=>({
    bodyKids: document.body.children.length,
    ls: Object.keys(localStorage).filter(k=>/mute|notif/i.test(k)).map(k=>k+'='+String(localStorage.getItem(k)).slice(0,70)),
    label: (document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaLabel
  }));
  out.before=await snap();
  await page.locator(sel).first().click();
  await page.waitForTimeout(1200);
  out.after=await snap();
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;}).map(e=>e.textContent.trim().slice(0,50)));
  await page.reload(); await page.waitForTimeout(3500);
  out.afterReload = await page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed')};}, sel);
  const ch=page.url().split('/c/')[1];
  out.apiMute = await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({duration_seconds:3600})});
    return {status:r.status, body:(await r.text()).slice(0,120)};
  }, ch);
  await page.reload(); await page.waitForTimeout(3500);
  out.afterApiMute = await page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed')};}, sel);
  return out;
};
