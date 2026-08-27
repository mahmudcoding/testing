export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const mid=process.env.QA_MID;
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/call/${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>{
    const all=[...document.querySelectorAll('button, a[href], input, select, textarea, summary, [role=button], [role=link], [tabindex]:not([tabindex="-1"])')];
    return {url:location.href, bodyText:document.body.innerText.replace(/\s+/g,' ').trim().slice(0,300), interactiveCount:all.length,
      sample:all.map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8)};
  });
};
