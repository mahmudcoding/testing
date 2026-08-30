import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  await page.evaluate(()=>{ window.__blobText=null; const o=URL.createObjectURL.bind(URL);
    URL.createObjectURL=(b)=>{ try{ b.text().then(t=>{window.__blobText=t;}); }catch(e){} return o(b); }; });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Export log/i));
  await page.waitForTimeout(3000);
  out.text = await page.evaluate(()=>window.__blobText||'(none)');
  return out;
};
