export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/workspace`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.text = await page.evaluate(()=>{
    const txt=(document.querySelector('main')||document.body).innerText||'';
    const i=txt.indexOf('Danger zone');
    return i<0?null:txt.slice(i,i+300).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,8);
  });
  out.leave = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/Leave workspace/i.test(x.innerText||''));
    return b?{text:(b.innerText||'').trim(),disabled:b.disabled}:'not found';
  });
  out.identitySubtitle = await page.evaluate(()=>{
    const txt=(document.querySelector('main')||document.body).innerText||'';
    const i=txt.indexOf('Workspace identity');
    return i<0?null:txt.slice(i,i+120).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,4);
  });
  return out;
}
