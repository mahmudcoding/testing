export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const snap = () => page.evaluate(()=>{
    const vis=el=>{const b=el.getBoundingClientRect(); return b.width>0&&b.height>0;};
    const m=document.querySelector('main');
    return {btns:[...m.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,45)}`),
            texts:[...m.querySelectorAll('input[type=text]')].filter(vis).map(i=>`${i.placeholder}="${i.value}"`),
            boxN:m.querySelectorAll('input[type=checkbox]').length};
  });
  const before = await snap();
  await page.evaluate(()=>{ for(const tr of document.querySelectorAll('tr')){ if((tr.innerText||'').includes('QA D2 audit reader')){ const b=[...tr.querySelectorAll('button')].find(x=>/^Edit/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.scrollIntoView({block:'center'});b.click();return;} } } });
  await page.waitForTimeout(2200);
  const after = await snap();
  return {before, after};
};
