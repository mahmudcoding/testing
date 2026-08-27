import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type(':@ QA Bob unread'); await page.waitForTimeout(5200);
  out.screen = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const inp=d.querySelector('input');
     return {visible:t.slice(0,300), inputValue: inp?String(inp.value):null,
             chip:[...d.querySelectorAll('button')].filter(vis)
               .map(b=>b.getAttribute('aria-label')||'').filter(a=>/filter/i.test(a))}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
