import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(() => { ${VISFN}
     const hits=[...document.querySelectorAll('a,button,[role=treeitem],[role=listitem],li,div')]
       .filter(vis)
       .filter(e=>{ const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                    return /qa-general/i.test(own); })
       .slice(0,4)
       .map(e=>{ const path=[]; let n=e;
          for(let i=0;i<5&&n;i++){ path.push(n.tagName+(n.getAttribute&&n.getAttribute('role')?'['+n.getAttribute('role')+']':'')); n=n.parentElement; }
          const row=e.closest('a,button,[role=treeitem],li')||e;
          return {ownTag:e.tagName, path:path.join(' < '),
                  rowTag:row.tagName, rowRole:row.getAttribute('role')||'',
                  rowText:(row.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50),
                  inNav: !!e.closest('nav'), navCount:document.querySelectorAll('nav').length}; });
     return {n:hits.length, hits}; })()`);
};
