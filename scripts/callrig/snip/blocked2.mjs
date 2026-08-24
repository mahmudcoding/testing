export default async ({page}) => {
  const M='V4OTLVMJL42ZGIG';
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/settings')){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const api = await page.evaluate(async (M) => {
    const put = async body => { const r = await fetch('/api/v1/meeting/'+M+'/settings',{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); return r.status+' :: '+(await r.text()).slice(0,240); };
    return {mic_blocked: await put({mic_mode:'blocked_all'}), cam_blocked: await put({camera_mode:'blocked_all'}), ss_blocked: await put({screen_share_mode:'blocked_all'})};
  }, M);
  const uiBefore = await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-mic-mode-blocked_all"]'); return b?{d:b.disabled, ac:b.getAttribute('aria-checked'), op:getComputedStyle(b).opacity, pe:getComputedStyle(b).pointerEvents, cursor:getComputedStyle(b).cursor}:null; });
  await page.locator('[data-testid="meeting-settings-mic-mode-blocked_all"]').click();
  await page.waitForTimeout(2500);
  const afterClick = await page.evaluate(() => ({
    mic: ['allowed_all','on_request','blocked_all'].map(k=>k+'='+((document.querySelector('[data-testid="meeting-settings-mic-mode-'+k+'"]')||{}).getAttribute?.('aria-checked'))),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,180))
  }));
  const finalSettings = await page.evaluate(async (M) => (await (await fetch('/api/v1/meeting/'+M+'/settings',{credentials:'include'})).text()).slice(0,300), M);
  return {api, uiBefore, afterClick, net, finalSettings};
};
