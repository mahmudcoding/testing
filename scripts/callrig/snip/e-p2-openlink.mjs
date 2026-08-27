import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // arrive cold on the copied link
  await page.goto(BASE+'/w/'+WS+'/files?file='+process.env.QA_FID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,70);
  out.state = await page.evaluate(`(() => { ${VISFN}
    const panes=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
      .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
    const d=panes.pop();
    const m=document.querySelector('main')||document.body;
    return { openedSomething: !!d,
             paneText: d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,200):null,
             mainTail: (m.innerText||'').replace(/\\s+/g,' ').slice(0,200) }; })()`);
  return out;
};
