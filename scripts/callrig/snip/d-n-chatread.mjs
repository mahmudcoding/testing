export default async ({page}) => {
  return await page.evaluate(()=>{
    const l=document.querySelector('[data-testid="in-call-chat-list"]');
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    return {list:l?(l.innerText||'').replace(/\s+/g,' ').slice(0,900):null,
      rows:l?[...l.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,30):null,
      panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null};
  });
};
