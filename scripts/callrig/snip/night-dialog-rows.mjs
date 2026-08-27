export default async ({page}) => page.evaluate(()=>{
  const d=[...document.querySelectorAll('[role="dialog"]')].pop();
  if(!d) return {none:true};
  const hits=[...d.querySelectorAll('*')].filter(e=>(e.textContent||'').trim()==='QA Carol');
  return {tags: hits.slice(0,3).map(e=>{
    let chain=[]; let n=e;
    for(let i=0;i<4&&n;i++,n=n.parentElement) chain.push(n.tagName.toLowerCase()+(n.getAttribute('role')?'['+n.getAttribute('role')+']':''));
    return chain.join(' < ');}),
    inputs:[...d.querySelectorAll('input')].map(i=>({type:i.type, checked:i.checked, al:i.getAttribute('aria-label')})).slice(0,8)};
});
