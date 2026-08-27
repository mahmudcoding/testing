export default async ({page}) => {
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const ta=document.querySelector('aside textarea');
    const send=[...document.querySelectorAll('aside button')].find(b=>/^Send$/i.test((b.getAttribute('aria-label')||b.textContent||'').trim()));
    const aside=document.querySelector('aside');
    return {composer: !!ta, composerDisabled: ta?ta.disabled:null,
      sendDisabled: send?send.disabled:null,
      note:(aside?(aside.innerText.match(/[^\n]*(disabled|turned off|cannot send|off)[^\n]*/i)||[''])[0].trim().slice(0,60):null)};
  });
};
