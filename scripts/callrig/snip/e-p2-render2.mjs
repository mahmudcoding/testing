export default async ({page}) => {
  const out={};
  await page.goto('file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/render2/report.html',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const measure = `(() => {
    const de=document.documentElement;
    const wide=[...document.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();
      return r.width>2 && (r.right>innerWidth+2 || r.left<-2);}).map(el=>el.tagName).slice(0,5);
    const pres=[...document.querySelectorAll('pre')];
    const body=getComputedStyle(document.body);
    return { pageScrollsX:de.scrollWidth>de.clientWidth, docW:de.scrollWidth, viewW:de.clientWidth,
             overflowing:wide, articles:document.querySelectorAll('article').length,
             preCount:pres.length, presAutoX:pres.filter(p=>getComputedStyle(p).overflowX==='auto').length,
             presScrolling:pres.filter(p=>p.scrollWidth>p.clientWidth).length,
             bodyBg:body.backgroundColor, bodyFg:body.color, fonts:document.fonts?document.fonts.status:'n/a' }; })()`;
  await page.emulateMedia({colorScheme:'light'}); await page.waitForTimeout(1200);
  out.light = await page.evaluate(measure);
  await page.emulateMedia({colorScheme:'dark'}); await page.waitForTimeout(1200);
  out.dark = await page.evaluate(measure);
  await page.evaluate(`(() => document.documentElement.setAttribute('data-theme','light'))()`);
  await page.waitForTimeout(900);
  out.forcedLightOnDarkOS = await page.evaluate(`(() => ({bg:getComputedStyle(document.body).backgroundColor}))()`);
  await page.evaluate(`(() => document.documentElement.setAttribute('data-theme','dark'))()`);
  await page.emulateMedia({colorScheme:'light'}); await page.waitForTimeout(900);
  out.forcedDarkOnLightOS = await page.evaluate(`(() => ({bg:getComputedStyle(document.body).backgroundColor}))()`);
  await page.setViewportSize({width:1280,height:800}); await page.waitForTimeout(1200);
  out.at1280 = await page.evaluate(measure);
  await page.setViewportSize({width:1920,height:1080});
  return out;
};
