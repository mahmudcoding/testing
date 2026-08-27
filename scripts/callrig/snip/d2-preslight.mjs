// Light presence probe: aria-labels/titles only, no full-DOM walk.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const marks=[...document.querySelectorAll('[aria-label],[title],[data-status],[data-presence],[data-online]')]
      .map(e=>({al:e.getAttribute('aria-label')||e.getAttribute('title')||'',
                ds:e.getAttribute('data-status')||e.getAttribute('data-presence')||e.getAttribute('data-online')||''}))
      .filter(m=>/online|offline|active|away|last seen/i.test(m.al+' '+m.ds));
    return {n:marks.length, marks:marks.slice(0,20)};
  });
};
