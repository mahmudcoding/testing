import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const bad=[];
  page.on('response', r=>{ if(r.status()>=400) bad.push({st:r.status(), url:r.url().replace(BASE,'').slice(0,110), type:r.request().resourceType()}); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  return {n:bad.length, bad:bad.slice(0,8)};
};
