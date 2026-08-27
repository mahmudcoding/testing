const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const DUMP = `(() => { const ls={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); ls[k]=(localStorage.getItem(k)||'').slice(0,200);} 
  const ss={}; for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i); ss[k]=(sessionStorage.getItem(k)||'').slice(0,120);} 
  return { ls, ss, cookies:document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(Boolean) }; })`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\//.test(u)&&!/settings|appearance/.test(u)) return;
    net.push(`${r.request().method()} ${u.slice(0,46)} <- ${(r.request().postData()||'').slice(0,90)} -> ${r.status()}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };
  await load();
  const before = await page.evaluate(`${DUMP}()`);
  // find the Message layout control and its options
  const controls = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,[role=switch],[role=combobox],[role=radio],input')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .map((e,i)=>({i, tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
        t:(e.innerText||'').trim().slice(0,30), st:e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||'',
        label:(()=>{let n=e,b='';for(let k=0;k<5&&n;k++){n=n.parentElement;if(!n)break;
          const x=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(x.length>4&&x.length<110){b=x;break;}}return b;})().slice(0,72) })); })()`);
  const target = controls.find(c=>/Message layout/i.test(c.label));
  if (!target) return { err:'no Message layout control', controls };
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('button,[role=switch],[role=combobox],[role=radio],input')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300);
    l[${target.i}].click(); })()`);
  await page.waitForTimeout(900);
  const opts = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>(o.innerText||'').trim()); })()`);
  if (opts.length) {
    const pick = opts.find(o=>/compact/i.test(o)) || opts[opts.length-1];
    await page.evaluate(`(() => { const vis=(${VIS});
      const o=[...document.querySelectorAll('[role=option]')].filter(vis).filter(x=>(x.innerText||'').trim()===${JSON.stringify('X')});
      })()`);
    await page.evaluate(`(() => { const vis=(${VIS});
      const hit=[...document.querySelectorAll('[role=option]')].filter(vis).filter(x=>(x.innerText||'').trim()===PICK);
      if(hit.length) hit[0].click(); })()`.replace('PICK', JSON.stringify(pick)));
    await page.waitForTimeout(1000);
  }
  const barBefore = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  if (barBefore.some(t=>/^Save/.test(t))) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2500);
  }
  const afterSave = await page.evaluate(`${DUMP}()`);
  await load();
  const afterReload = await page.evaluate(`${DUMP}()`);
  const stateAfterReload = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('button,[role=switch],[role=combobox],[role=radio],input')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300);
    return l[${target.i}] ? (l[${target.i}].innerText||'').trim().slice(0,30) : '(gone)'; })()`);
  const diff = (a,b) => { const out={};
    for (const k of new Set([...Object.keys(a.ls),...Object.keys(b.ls)])) if (a.ls[k]!==b.ls[k]) out[k]=[a.ls[k]||'(absent)', b.ls[k]||'(absent)'];
    return out; };
  return { targetLabel:target.label, targetWas:target.t, options:opts, barBefore, stateAfterReload,
           lsDiff_beforeVsAfterSave: diff(before, afterSave),
           lsDiff_afterSaveVsAfterReload: diff(afterSave, afterReload),
           sessionKeys:{before:Object.keys(before.ss), after:Object.keys(afterSave.ss)},
           cookies:before.cookies, net };
};
