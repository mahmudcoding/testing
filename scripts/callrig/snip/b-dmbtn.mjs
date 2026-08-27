export default async ({page}) => {
  return await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Start call');
    if(!b) return {none:true, url:location.href};
    const r=b.getBoundingClientRect();
    return { url:location.href, disabled:b.disabled, ariaDis:b.getAttribute('aria-disabled'),
      pe:getComputedStyle(b).pointerEvents, cursor:getComputedStyle(b).cursor,
      onScreen: r.left>=0 && r.right<=innerWidth && r.width>0 };
  });
};
