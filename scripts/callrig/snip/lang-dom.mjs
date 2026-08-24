export default async ({page}) => await page.evaluate(()=>{
  const all=[...document.querySelectorAll('*')];
  const lab=all.find(e=>e.children.length===0 && /^Language$/.test((e.textContent||'').trim()));
  if(!lab) return 'no label';
  let p=lab.parentElement; for(let i=0;i<3 && p;i++){ p=p.parentElement; }
  return {html: (p||lab.parentElement).outerHTML.slice(0,1200)};
});
