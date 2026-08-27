export default async ({page}) => page.evaluate(()=>{
  const els=[...document.querySelectorAll('[data-message-id]')];
  const out=[];
  for(const e of els){
    const t=(e.innerText||'').replace(/\n+/g,' | ').trim();
    if(/call/i.test(t)) out.push({id:e.getAttribute('data-message-id'), txt:t.slice(0,110)});
  }
  return {count:out.length, entries: out.slice(-5)};
});
