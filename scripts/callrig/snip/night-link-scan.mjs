export default async ({page}) => page.evaluate(()=>{
  const btns=[...document.querySelectorAll('button,[role="menuitem"],a')]
    .map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30),
              tid:e.getAttribute('data-testid'),
              vis:(()=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})()}))
    .filter(x=>x.l && /invite|link|share|guest|copy/i.test(x.l));
  const bodyHits=[...(document.body.innerText.match(/[^\n]*(Invite link|guest link|Copy link)[^\n]*/gi)||[])].slice(0,3);
  return {controls:btns.slice(0,10), bodyHits};
});
