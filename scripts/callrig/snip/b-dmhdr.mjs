export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    const m=document.querySelector('main')||document.body;
    return [...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,10);
  });
};
