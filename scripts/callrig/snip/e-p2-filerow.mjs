import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const snapshot = `(() => { ${VISFN}
    const m=document.querySelector('main');
    return interactives(m).map(x=>'<'+x.tag+'> "'+x.label.slice(0,26)+'" @'+x.x+','+x.y); })()`;
  out.before = await page.evaluate(snapshot);
  // hover the image file row
  const fileBtn = page.locator('main button').filter({hasText:'qa-e-image.png'}).first();
  out.fileBtnBox = await fileBtn.boundingBox();
  await fileBtn.hover();
  await page.waitForTimeout(1500);
  out.afterHover = await page.evaluate(snapshot);
  const before=new Set(out.before), after=out.afterHover.filter(x=>!before.has(x));
  out.appearedOnHover = after;
  return out;
};
