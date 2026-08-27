export default async ({page}) => page.evaluate(()=>{
  const p=document.querySelector('[data-testid="call-side-panel-slot"]');
  if(!p) return {none:true};
  return {text:(p.innerText||'').replace(/\n+/g,' | ').slice(0,260),
    buttons:[...p.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28), tid:b.getAttribute('data-testid')})).slice(0,10)};
});
