export default async ({page}) => {
  const d = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return {none:true};
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      btns:[...d.querySelectorAll('button')].map(b=>({t:JSON.stringify((b.innerText||'').trim()).slice(0,26),
        l:(b.getAttribute('aria-label')||'').slice(0,26),
        vis:b.getBoundingClientRect().width>0}))};
  });
  return d;
};
