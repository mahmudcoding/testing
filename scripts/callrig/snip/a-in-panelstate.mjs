export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const slots=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')];
    const chatBtn=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-chat-toggle');
    return {slotCount:slots.length,
      slotText:slots.map(s=>(s.innerText||'').replace(/\n+/g,' | ').slice(0,200)),
      chatBtn: chatBtn?{aria:chatBtn.getAttribute('aria-label'),pressed:chatBtn.getAttribute('aria-pressed'),disabled:chatBtn.disabled,visible:vis(chatBtn)}:null,
      editables:[...r.querySelectorAll('[contenteditable="true"]')].filter(vis).map(e=>e.getAttribute('aria-label')),
      overlayTail:((r.innerText||'').replace(/\n+/g,' | ')).slice(-200)};
  });
};
