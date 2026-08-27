export default async ({ page }) => {
  return await page.evaluate(() => {
    const t = document.querySelector('textarea[placeholder="Message everyone"]');
    const send = [...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Send');
    const body = document.body.innerText || '';
    let ctx = null;
    if (t) { let n=t, h=0; while(n&&h<5){ n=n.parentElement; h++;
      if (n && /disabled|turned off|not allowed|host|off for/i.test(n.innerText||'')) {
        ctx = n.innerText.replace(/\n+/g,' | ').slice(0,140); break; } } }
    return { composerPresent: !!t, composerDisabled: t ? t.disabled : null,
             composerPlaceholder: t ? t.getAttribute('placeholder') : null,
             sendDisabled: send ? send.disabled : null,
             nearbyExplanation: ctx,
             bodyMentionsChatOff: /chat (is )?(off|disabled|turned off)|host (has )?disabled/i.test(body) };
  });
};
