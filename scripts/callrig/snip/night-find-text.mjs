export default async ({page}) => page.evaluate((needle)=>{
  const body=document.body.innerText;
  const idx=body.indexOf(needle);
  const els=[...document.querySelectorAll('*')].filter(e=>
    (e.textContent||'').includes(needle) && e.children.length===0);
  return {inBodyText: idx>=0, bodyLen:body.length,
    context: idx>=0 ? body.slice(Math.max(0,idx-80), idx+120).replace(/\n+/g,' | ') : null,
    leafMatches: els.slice(0,3).map(e=>({tag:e.tagName.toLowerCase(),
      txt:(e.textContent||'').trim().slice(0,40),
      rect:(r=>[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)])(e.getBoundingClientRect())}))};
}, process.env.QA_NEEDLE||'QA SCHED');
