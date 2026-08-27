export default async ({page}) => {
  const out={};
  const url='file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/render/report.html';
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const measure = `(() => {
    const de=document.documentElement;
    const wide=[...document.querySelectorAll('*')].filter(el=>{
      const r=el.getBoundingClientRect();
      return r.width>2 && (r.right>innerWidth+2 || r.left<-2);
    }).map(el=>el.tagName+'.'+String(el.className||'').slice(0,26)).slice(0,6);
    // pre blocks must scroll inside themselves, not push the page
    const pres=[...document.querySelectorAll('pre')].map(p=>({
      ov:getComputedStyle(p).overflowX, scrolls:p.scrollWidth>p.clientWidth}));
    const body=getComputedStyle(document.body);
    return { pageScrollsX: de.scrollWidth>de.clientWidth,
             docW:de.scrollWidth, viewW:de.clientWidth,
             overflowingEls:wide,
             preCount:pres.length, presWithAutoX:pres.filter(p=>p.ov==='auto').length,
             presScrolling:pres.filter(p=>p.scrolls).length,
             bodyBg:body.backgroundColor, bodyColor:body.color,
             articles:document.querySelectorAll('article').length,
             h2:document.querySelectorAll('article h2').length,
             fontLoaded:document.fonts? document.fonts.status:'n/a' }; })()`;
  await page.emulateMedia({colorScheme:'light'}); await page.waitForTimeout(1200);
  out.light = await page.evaluate(measure);
  await page.emulateMedia({colorScheme:'dark'}); await page.waitForTimeout(1200);
  out.dark = await page.evaluate(measure);
  // explicit data-theme, both directions
  await page.evaluate(`(() => document.documentElement.setAttribute('data-theme','light'))()`);
  await page.waitForTimeout(900);
  out.forcedLightUnderDarkOS = await page.evaluate(`(() => ({bg:getComputedStyle(document.body).backgroundColor, fg:getComputedStyle(document.body).color}))()`);
  await page.evaluate(`(() => document.documentElement.setAttribute('data-theme','dark'))()`);
  await page.waitForTimeout(900);
  await page.emulateMedia({colorScheme:'light'}); await page.waitForTimeout(900);
  out.forcedDarkUnderLightOS = await page.evaluate(`(() => ({bg:getComputedStyle(document.body).backgroundColor, fg:getComputedStyle(document.body).color}))()`);
  return out;
};
