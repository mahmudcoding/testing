import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${VISFN} ${boxVisFn}
  const panels=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis);
  const named=panels.map(p=>(p.innerText||'').replace(/\\s+/g,' ').slice(0,26));
  return {url:location.pathname.slice(-18), bodyKids:document.body.children.length,
    globalSearch: named.some(t=>/Global search/i.test(t)),
    insertLink: named.some(t=>/Insert link/i.test(t)),
    displaySettings: named.some(t=>/Display settings/i.test(t)),
    focus: document.activeElement? document.activeElement.tagName+'['+(document.activeElement.getAttribute('aria-label')||'')+']':'?'}; })()`;
export default async ({page}) => {
  const out={};
  for (const [ctx,path] of [['inChannel','/c/C4QEGENERAL0001'],['onFiles','/files']]) {
    const o={};
    for (const [name,key] of [['CmdK','Meta+KeyK'],['CmdN','Meta+KeyN'],['CmdShiftT','Meta+Shift+KeyT']]) {
      await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(7000);
      const before = await page.evaluate(st);
      await page.keyboard.press(key);
      await page.waitForTimeout(3000);
      const after = await page.evaluate(st);
      o[name] = 'before bk'+before.bodyKids+' | after bk'+after.bodyKids
        +' gs='+after.globalSearch+' il='+after.insertLink+' ds='+after.displaySettings
        +' url='+after.url+' focus='+after.focus;
    }
    out[ctx]=o;
  }
  return out;
};
