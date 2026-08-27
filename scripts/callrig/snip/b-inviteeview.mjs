export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWC2SM1HXJ3VN';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { url:location.href,
      header:(t.match(/Back to Calls.{0,180}/)||[t.slice(0,180)])[0],
      tabs:[...document.querySelectorAll('[role=tab]')].map(x=>x.innerText.replace(/\s+/g,' ').trim()),
      denied:/not found|no access|denied|нет доступа/i.test(t) };
  });
};
