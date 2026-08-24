export default async ({page}) => await page.evaluate(()=>{
  const p=document.querySelector('[data-testid="in-call-chat-panel"]');
  if(!p) return 'no panel';
  const ta=p.querySelector('textarea');
  const toBtn=[...p.querySelectorAll('button')].find(b=>/QA |Everyone/.test((b.textContent||'').trim()));
  return {
    placeholder: ta?ta.placeholder:null,
    ariaLabel: ta?ta.getAttribute('aria-label'):null,
    recipientButton: toBtn?(toBtn.textContent||'').trim().slice(0,40):null,
    panelHead: p.innerText.replace(/\n+/g,' | ').slice(0,220)
  };
});
