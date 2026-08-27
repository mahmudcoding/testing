export default async ({page}) => {
  const tb=await page.$('[data-testid="call-toolbar"]');
  const btns=await tb.$$('button');
  for (const b of btns){ const l=await b.getAttribute('aria-label')||''; if(/^More$/i.test(l)){ await b.click(); await page.waitForTimeout(2000); break; } }
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(m=>!['call-overlay-expanded','participants-list-panel','in-call-chat-panel','meeting-settings-panel','breakout-rooms-panel'].includes(m.getAttribute('data-testid')));
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,400), items:[...m.querySelectorAll('button,[role="menuitem"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),t:e.getAttribute('data-testid'),d:e.disabled}))}:{none:true};
  });
};
