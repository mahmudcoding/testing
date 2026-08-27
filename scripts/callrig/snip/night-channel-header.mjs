export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main')||document.body;
  return {buttons:[...m.querySelectorAll('button')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), tid:b.getAttribute('data-testid')}))
      .filter(x=>x.l).slice(0,16),
    head:(m.innerText||'').replace(/\n+/g,' | ').slice(0,140)};
});
