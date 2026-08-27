export default async ({page}) => page.evaluate(()=>{
  const d=[...document.querySelectorAll('[role="dialog"]')].pop();
  const hits=[...d.querySelectorAll('*')].filter(e=>
    (e.textContent||'').trim()==='QA Alice' || (e.textContent||'').trim().startsWith('QA Alice'));
  return hits.slice(0,4).map(e=>{
    let chain=[]; let n=e;
    for(let i=0;i<4&&n;i++,n=n.parentElement){
      chain.push({tag:n.tagName.toLowerCase(), role:n.getAttribute('role'),
        tid:n.getAttribute('data-testid'), cls:(n.className||'').toString().slice(0,34),
        clickable:!!(n.onclick||n.tagName==='BUTTON'||n.tagName==='LABEL'||n.getAttribute('role')==='option')});}
    return {txt:(e.textContent||'').trim().slice(0,26), chain};
  });
});
