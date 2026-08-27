export default async ({page}) => {
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    if(!p) return {none:true};
    const ta=p.querySelector('textarea');
    return {
      panelTail: p.innerText.replace(/\n+/g,' | ').slice(-260),
      composerAttrs: ta?{maxLength:ta.maxLength, ph:ta.placeholder, rows:ta.rows}:null,
      controlsNearComposer: [...p.querySelectorAll('button,select,input')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30), t:e.getAttribute('data-testid'), tag:e.tagName.toLowerCase()})).slice(-10),
      hasFileInput: !!p.querySelector('input[type=file]')
    };
  });
};
