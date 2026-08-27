export default async ({page}) => page.evaluate(()=>{
  const cands=[...document.querySelectorAll('aside,[class*="panel"],[data-testid*="panel"]')]
    .filter(e=>e.innerText && e.innerText.length>20);
  const p=cands.sort((a,b)=>b.innerText.length-a.innerText.length)[0];
  if(!p) return {none:true};
  return {text:p.innerText.replace(/\n+/g,' | ').slice(0,400),
    buttons:[...p.querySelectorAll('button')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30), tid:b.getAttribute('data-testid')})).slice(0,16)};
});
