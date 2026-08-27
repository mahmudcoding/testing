import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.build = await page.evaluate(`(async()=>{const r=await fetch('/',{credentials:'include'});const t=await r.text();
    return (t.match(/data-dpl-id="[^"]*"/)||['?'])[0];})()`);

  // ---- F1: full search scope
  for (const [tag,ch] of [['fromA','C4QEGENERAL0001'],['fromB','C4QEPRIVATE0001']]) {
    await page.goto(BASE+'/w/'+WS+'/c/'+ch+'/search?q=qelanex7k2', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out['F1_'+tag] = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\n+/g,' ');
      const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
      const scope=interactives(m).filter(x=>/remove/i.test(x.label)&&/#/.test(x.label)).length;
      return (c?'All='+c[1]:'?')+' scopeChip='+scope+(/in this workspace/.test(t)?' promisesWorkspace':''); })()`);
  }

  // ---- F3: presence in Directories
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.F3 = await page.evaluate(`(async()=>{
    const pr=await (await fetch('/api/v1/workspaces/${WS}/presence',{credentials:'include'})).json();
    const on=(pr.presences||[]).filter(p=>p.online).length, tot=(pr.presences||[]).length;
    const m=document.querySelector('main');
    const rows=[...m.querySelectorAll('div')].filter(d=>String(d.className).includes('min-h-16')&&/QA /.test(d.innerText||''));
    const st=rows.reduce((n,r)=>n+[...r.querySelectorAll('span')].filter(s=>/bg-green|bg-status/i.test(String(s.className||''))).length,0);
    return 'api '+on+'/'+tot+' online, rows '+rows.length+', statusNodes '+st; })()`);

  // ---- F5: :@ filter
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const reqs=[]; page.on('request', r=>{ if(r.url().includes('/api/v1/search')) reqs.push(decodeURIComponent(r.url()).replace(/^https:\/\/[^/]+\/api\/v1\/search\?/,'').slice(0,70)); });
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  const inp = page.locator('input[aria-label="Search messages, channels, people, files…"]').first();
  reqs.length=0; await inp.fill('unread'); await page.waitForTimeout(3200);
  const plain = reqs.slice(-1)[0];
  reqs.length=0; await inp.fill(''); await page.waitForTimeout(500); await inp.fill(':@ Bob unread'); await page.waitForTimeout(3200);
  out.F5 = 'plain[' + plain + '] vs atFilter[' + (reqs.slice(-1)[0]||'(cache hit)') + ']';
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);

  // ---- F8: Files view + sort reset
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const viewNow = `(() => { ${VISFN} const m=document.querySelector('main');
    return [...m.querySelectorAll('button')].filter(b=>vis(b)&&/view$/i.test(b.getAttribute('aria-label')||'')&&b.getAttribute('aria-pressed')==='true').map(b=>b.getAttribute('aria-label'))[0]||'?'; })()`;
  await page.getByRole('button',{name:'List view'}).first().click(); await page.waitForTimeout(2000);
  const chosen = await page.evaluate(viewNow);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.F8 = 'chose['+chosen+'] afterReload['+await page.evaluate(viewNow)+']';

  // ---- F10: Reset all leaves theme
  await page.keyboard.press('Meta+Shift+KeyT'); await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p,/^Dark$/):'x'; })()`);
  await page.waitForTimeout(2000);
  const before = await page.evaluate(`(() => document.documentElement.getAttribute('data-theme'))()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p,/^Reset all$/):'x'; })()`);
  await page.waitForTimeout(2500);
  out.F10 = 'setDark['+before+'] afterResetAll['+await page.evaluate(`(() => document.documentElement.getAttribute('data-theme'))()`)+']';
  // restore
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p,/^Light$/):'x'; })()`);
  await page.waitForTimeout(1500);
  out.themeRestored = await page.evaluate(`(() => document.documentElement.getAttribute('data-theme'))()`);
  return out;
};
