import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type(':in #qa-empty unread'); await page.waitForTimeout(5200);
  // what does the user actually SEE around the chip? empty state wording, counts, any warning
  out.screen = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {full:t.slice(0,320),
             hasWarning:/(не найден|not found|no access|нет доступа|unavailable|недоступ)/i.test(t),
             footer:(t.match(/Showing[^.]*\\.[^↑]*/)||[''])[0].slice(0,80),
             chipText:[...d.querySelectorAll('button')].filter(vis)
               .map(b=>({tx:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                         al:(b.getAttribute('aria-label')||'').slice(0,30)}))
               .filter(b=>/filter/i.test(b.al))}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
