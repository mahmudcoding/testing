import {WS, BASE} from './e-p2-helpers.mjs';
const head = () => {
  const m=document.querySelector('main')||document.body;
  const t=m.innerText.replace(/\s+/g,' ');
  return (t.match(/^CALENDAR ([^A-Z]{0,40})/)||['',''])[1].trim() ||
         (t.match(/[A-Z][a-z]+ \d{4}|\d{1,2}\s*[–-]\s*\d{1,2} \w+ \d{4}/)||[''])[0];
};
async function walk(page, view, dir, n){
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:new RegExp('^'+view+'$')}).first().click();
  await page.waitForTimeout(2800);
  const seq=[await page.evaluate(head)];
  for(let i=0;i<n;i++){
    const ok=await page.evaluate((d)=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const m=document.querySelector('main');
      const b=[...m.querySelectorAll('button')].filter(vis)
        .find(e=>new RegExp(d,'i').test(e.getAttribute('aria-label')||''));
      if(b){b.click();return true;} return false;
    }, dir);
    if(!ok){seq.push('NO CONTROL');break;}
    await page.waitForTimeout(2000);
    seq.push(await page.evaluate(head));
  }
  return {view, dir, seq};
}
export default async ({page}) => ({
  monthBack: await walk(page,'Month','previous',9),
  weekFwd:   await walk(page,'Week','next',20),
});
