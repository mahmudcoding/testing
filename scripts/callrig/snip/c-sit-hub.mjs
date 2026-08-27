export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return {url:page.url(), live: await page.evaluate(()=>{const m=document.querySelector('main')||document.body; const t=(m.innerText||''); const i=t.indexOf('Live now'); return i<0?null:t.slice(i,i+120).replace(/\n+/g,' | ');})};
};
