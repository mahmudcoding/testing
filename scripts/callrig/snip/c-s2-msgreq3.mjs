export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(7000);
  const found=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const cands=[...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .filter(b=>/Message requests/i.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    if(!cands.length) return null;
    cands[0].setAttribute('data-qa-req','1');
    return {tag:cands[0].tagName, label:(cands[0].getAttribute('aria-label')||cands[0].textContent||'').trim().slice(0,30),
      href:cands[0].getAttribute('href')};});
  out.found=found;
  if(!found) return out;
  await page.locator('[data-qa-req="1"]').click();
  await page.waitForTimeout(5000);
  out.screen=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const m=document.querySelector('main');
    return {url:location.pathname+location.search,
      txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,300),
      btns:[...document.querySelectorAll('main button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22)).slice(0,16)};});
  return out;
};
