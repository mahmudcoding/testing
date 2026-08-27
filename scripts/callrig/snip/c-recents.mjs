export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body; const txt=(m.innerText||'');
    const i=txt.indexOf('Recent calls');
    return {rows: i<0? null : txt.slice(i, i+700).replace(/\n+/g,' | ')};
  });
};
