export default async ({page}) => page.evaluate(()=>{
  const p=document.querySelector('[data-testid="participants-list-panel"]');
  if(!p) return {err:'no panel'};
  return {buttons:[...p.querySelectorAll('button')].map((b,i)=>({i,
    aria:b.getAttribute('aria-label'), txt:(b.textContent||'').trim().slice(0,26), tid:b.getAttribute('data-testid')}))};
});
