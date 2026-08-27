export default async ({page}) => {
  await page.click('button[data-testid="call-controls-chat-toggle"]');
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const slots=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')];
    return {slots:slots.map(s=>(s.innerText||'').replace(/\n+/g,' | ').slice(0,240)),
      editables:[...r.querySelectorAll('[contenteditable="true"]')].filter(vis).map(e=>e.getAttribute('aria-label')),
      chatPressed:(document.querySelector('button[data-testid="call-controls-chat-toggle"]')||{}).getAttribute? document.querySelector('button[data-testid="call-controls-chat-toggle"]').getAttribute('aria-pressed'):null};
  });
};
