import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const list = `(() => { ${VISFN}
    const m=document.querySelector('main');
    return {files:[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''))
        .map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22)),
      favBtn:(()=>{const b=[...m.querySelectorAll('button')].filter(x=>vis(x)&&/^Favorites$/.test((x.textContent||'').trim()))[0];
        return b? 'pressed='+(b.getAttribute('aria-pressed')??'-') : 'not found';})(),
      summary:((m.innerText||'').match(/\\d+ files?\\s*·[^|\\n]*/)||['?'])[0].replace(/\\n/g,' ').slice(0,40)}; })()`;
  out.apiFavs = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.files||[];
    return a.filter(f=>f.is_favorite).map(f=>f.filename); })()`);
  out.a_before = await page.evaluate(list);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Favorites$/); })()`);
  await page.waitForTimeout(3000);
  out.b_filtered = await page.evaluate(list);
  out.clickOff = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Favorites$/); })()`);
  await page.waitForTimeout(3000);
  out.c_off = await page.evaluate(list);
  return out;
};
