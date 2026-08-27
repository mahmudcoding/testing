import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const FID='F4OWYV0TL02NVAK';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // ALK-1962: does Favorite work for a recipient?
  out.favorite = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/files/${FID}/favorite',{method:'POST',credentials:'include'});
     const t=await r.text(); return {st:r.status, body:t.slice(0,140)}; })()`);
  // and can a recipient delete a file they do not own?
  out.deleteAttempt = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/files/${FID}',{method:'DELETE',credentials:'include'});
     const t=await r.text(); return {st:r.status, body:t.slice(0,180)}; })()`);
  // is the file still there afterwards?
  out.stillThere = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/files/${FID}',{credentials:'include'});
     const t=await r.text(); return {st:r.status, body:t.slice(0,120)}; })()`);
  return out;
};
