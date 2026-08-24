export default async ({page}) => {
  const lang = await page.evaluate(()=>({lang:document.documentElement.lang, al: navigator.language}));
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2000); }
  const box = page.locator('textarea').last();
  const info = {};
  info.attrs = await page.evaluate(()=>{const x=[...document.querySelectorAll('textarea')].pop(); return x? {maxlength:x.getAttribute('maxlength'), ph:x.placeholder, aria:x.getAttribute('aria-label')}:null;});
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/messages')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  await box.fill('x'.repeat(600));
  await page.waitForTimeout(900);
  info.after600 = await page.evaluate(()=>{
    const x=[...document.querySelectorAll('textarea')].pop();
    const panel = x.closest('aside,div[data-testid]')||document.body;
    const send=[...panel.querySelectorAll('button')].find(b=>/send/i.test(b.getAttribute('aria-label')||b.textContent||''));
    return {len:x.value.length, sendDisabled: send? send.disabled:null,
      counter: [...panel.querySelectorAll('*')].filter(e=>e.children.length===0 && /\d+\s*\/\s*\d+|\d+ left|characters/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,40)),
      invalid: x.getAttribute('aria-invalid')};
  });
  // try sending
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  info.afterSend = await page.evaluate(()=>({
    len: ([...document.querySelectorAll('textarea')].pop()||{}).value?.length,
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,160)).filter(Boolean)}));
  return {lang, info, net};
};
