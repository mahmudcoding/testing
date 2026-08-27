import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const [path,label] of [['/w/'+WS+'/d/D0000000000BOGUS','bogus dm'],
                             ['/w/'+WS+'/c/C0000000000BOGUS','bogus channel']]){
    await page.goto('about:blank'); await page.waitForTimeout(800);
    await page.goto(BASE+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(10000);
    out[label] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main');
       const t=(m?m.innerText:document.body.innerText||'').replace(/\\s+/g,' ');
       // EVERY interactive node in main, no text filter
       const all=m?[...m.querySelectorAll('button,a,input,select,textarea,[role=button],[role=link],[tabindex],[contenteditable]')]
         .map(e=>({tag:e.tagName, tx:(e.innerText||'').trim().slice(0,20),
                   al:(e.getAttribute('aria-label')||'').slice(0,24), vis:vis(e)?1:0})):[];
       return {url:location.pathname+location.search,
               mainText:t.slice(0,180), mainTextLen:t.trim().length,
               nInteractive:all.length, nVisible:all.filter(x=>x.vis).length,
               sample:all.slice(0,6),
               scrollH:document.documentElement.scrollHeight,
               clientH:document.documentElement.clientHeight}; })()`);
  }
  return out;
};
