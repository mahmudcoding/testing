import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const list = `(() => { ${VISFN}
    const m=document.querySelector('main');
    return {files:[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''))
        .map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26)),
      countLine:((m.innerText||'').match(/\\d+ files?\\s*·[^|\\n]*/)||['?'])[0].replace(/\\n/g,' ').slice(0,40)}; })()`;
  out.a_allChats = await page.evaluate(list);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main');
    return clickDeepest(m, /QA Bob/); })()`);
  await page.waitForTimeout(3000);
  out.b_filtered = await page.evaluate(list);
  out.clickBack = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^All chats$/); })()`);
  await page.waitForTimeout(3000);
  out.c_backToAll = await page.evaluate(list);
  return out;
};
