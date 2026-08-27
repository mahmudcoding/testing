export default async ({page}) => page.evaluate(()=>{
  const cands=[...document.querySelectorAll('[data-testid]')]
    .filter(e=>/side|breakout|room/i.test(e.getAttribute('data-testid')||''));
  const p=cands.sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
  return p?{tid:p.getAttribute('data-testid'),
    text:(p.innerText||'').replace(/\n+/g,' | ').slice(0,240),
    buttons:[...p.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), tid:b.getAttribute('data-testid')})).slice(0,10)}
    :{none:true, tids:[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(x=>/room/i.test(x)).slice(0,6)};
});
