/* sector L: does the app show a real build version anywhere the user can see? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  const hasPip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  if(!hasPip){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
    await page.waitForTimeout(2500); await page.evaluate(DOM);
  }
  await page.evaluate(()=>window.__qa.clickDeepest(/^Settings$/i));
  await page.waitForTimeout(3000); await page.evaluate(DOM);
  const go = async (slug) => {
    const ok = await page.evaluate((s)=>{
      const q=window.__qa;
      const a=[...document.querySelectorAll('a[href]')].filter(q.vis).find(n=>new RegExp('/settings/'+s+'$').test(n.getAttribute('href')||''));
      if(!a) return false; a.click(); return true;
    }, slug);
    await page.waitForTimeout(3000); await page.evaluate(DOM);
    return {ok, url:page.url(), text: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,700))};
  };
  out.about = await go('about');
  out.markerAnywhere = await page.evaluate(()=>({
    inBody: (document.body.innerText||'').includes('__ALOQA'),
    versionLike: ((document.body.innerText||'').match(/v?\d+\.\d+\.\d+[^\s]*/g)||[]).slice(0,6)
  }));
  return out;
};
