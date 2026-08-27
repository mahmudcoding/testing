export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(7000);
  const pt=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const e=[...document.querySelectorAll('*')].filter(vis)
      .find(x=>/^Message requests/.test((x.textContent||'').trim()) && (x.textContent||'').trim().length<30);
    if(!e) return null;
    const r=e.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), tag:e.tagName,
      t:(e.textContent||'').trim()};});
  out.trigger=pt;
  if(!pt) return out;
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(4500);
  out.screen=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const m=document.querySelector('main');
    return {url:location.pathname+location.search,
      txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,280),
      btns:[...document.querySelectorAll('main button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22)).slice(0,16)};});
  return out;
};
