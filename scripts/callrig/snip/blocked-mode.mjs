export default async ({page}) => {
  const M='V4OTLVMJL42ZGIG';
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/settings')){ let b=''; try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  // direct API probe first
  const api = await page.evaluate(async (M) => {
    const put = async body => { const r = await fetch('/api/v1/meeting/'+M+'/settings',{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); return r.status+' :: '+(await r.text()).slice(0,300); };
    return {
      mic_blocked: await put({mic_mode:'blocked_all'}),
      cam_blocked: await put({camera_mode:'blocked_all'}),
      ss_blocked:  await put({screen_share_mode:'blocked_all'})
    };
  }, M);
  // now via UI
  const btn = page.locator('[data-testid="meeting-settings-mic-mode-blocked_all"]');
  const uiBefore = await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-mic-mode-blocked_all"]'); return b?{d:b.disabled, ac:b.getAttribute('aria-checked'), op:getComputedStyle(b).opacity, pe:getComputedStyle(b).pointerEvents}:null; });
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(1200); }
  const afterClick = await page.evaluate(() => {
    const b=document.querySelector('[data-testid="meeting-settings-mic-mode-blocked_all"]');
    return {blockedChecked: b && b.getAttribute('aria-checked'),
            allowedChecked: (document.querySelector('[data-testid="meeting-settings-mic-mode-allowed_all"]')||{}).getAttribute?.('aria-checked'),
            toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140))};
  });
  const save = page.locator('[data-testid="meeting-settings-save"]');
  let saved = null;
  if (await save.count()) { await save.click(); await page.waitForTimeout(2500);
    saved = await page.evaluate(() => ({
      toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,160)),
      micChecked: ['allowed_all','on_request','blocked_all'].map(k=>k+'='+((document.querySelector('[data-testid="meeting-settings-mic-mode-'+k+'"]')||{}).getAttribute?.('aria-checked')))
    }));
  }
  const finalSettings = await page.evaluate(async (M) => (await (await fetch('/api/v1/meeting/'+M+'/settings',{credentials:'include'})).text()).slice(0,300), M);
  return {api, uiBefore, afterClick, saved, net, finalSettings};
};
