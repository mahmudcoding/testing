export default async ({page}) => page.evaluate(()=>{
  const t=document.body.innerText;
  const hits=[...t.matchAll(/[^\n]*(hold|Hold|waiting|Waiting|admitted|Admitted|rejoin|Rejoin)[^\n]*/g)]
    .map(m=>m[0].trim().slice(0,60)).slice(0,6);
  const live=[...document.querySelectorAll('main button')]
    .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26))
    .filter(l=>/join|Join|resume|Resume/i.test(l)).slice(0,5);
  return {hits, joinButtons:live, url:location.pathname};
});
