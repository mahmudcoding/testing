import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MID='M4OWQ8K9SNKHQPD';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001?m='+MID, {waitUntil:'domcontentloaded'});
  const trace=[];
  for (let i=0;i<14;i++){
    await page.waitForTimeout(700);
    const s = await page.evaluate(`(() => { ${VISFN}
      const t=document.querySelector('[data-message-id="${MID}"]');
      if(!t) return 'absent';
      const cs=getComputedStyle(t);
      const sibs=[...document.querySelectorAll('[data-message-id]')].filter(x=>x!==t);
      const sibBg=sibs.length? getComputedStyle(sibs[0]).backgroundColor : '?';
      return 'bg='+cs.backgroundColor+' sibBg='+sibBg+' outline='+cs.outlineWidth
        +' ring='+(String(t.className||'').match(/ring[-\\w]*/)||['-'])[0]
        +' cls='+String(t.className||'').split(' ').filter(c=>/bg-|ring|accent|highlight|flash/.test(c)).join('.')
        +' inView='+(t.getBoundingClientRect().top>0 && t.getBoundingClientRect().top<innerHeight); })()`);
    trace.push(s);
  }
  out.trace = [...new Set(trace)];
  out.distinctFromSiblings = await page.evaluate(`(() => {
    const t=document.querySelector('[data-message-id="${MID}"]');
    if(!t) return 'absent';
    const sibs=[...document.querySelectorAll('[data-message-id]')].filter(x=>x!==t);
    const tb=getComputedStyle(t).backgroundColor;
    const diff=sibs.filter(s=>getComputedStyle(s).backgroundColor!==tb).length;
    return 'target bg '+tb+'; siblings differing: '+diff+' of '+sibs.length; })()`);
  return out;
};
