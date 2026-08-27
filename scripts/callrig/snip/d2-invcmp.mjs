// Enumerate every control on the Invites page with its disabled state, from a
// fresh load, polling until the page stops changing so "still loading" cannot
// be mistaken for "disabled".
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  const snap = () => page.evaluate(()=>{
    const vis=el=>{const b=el.getBoundingClientRect(); if(b.width<1||b.height<1) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    const m=document.querySelector('main')||document.body;
    const ctl=[...m.querySelectorAll('button,input,select,textarea,[role=combobox],[role=switch],[role=checkbox]')].filter(vis)
      .filter(e=>!/Filter settings/.test(e.placeholder||''))
      .map(e=>({tag:e.tagName.toLowerCase(), t:e.type||'', dis: e.disabled===true || e.getAttribute('aria-disabled')==='true',
                lbl:((e.getAttribute('aria-label')||e.innerText||e.placeholder||e.value)||'').replace(/\s+/g,' ').trim().slice(0,42)}));
    return {n:ctl.length, ctl, txt:(m.innerText||'').replace(/\s+/g,' ')};
  });
  let prev='', cur=null, rounds=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(1200); cur=await snap();
    const sig=JSON.stringify(cur.ctl); rounds.push(`${i}:${cur.n}ctl ${cur.ctl.filter(c=>c.dis).length}dis`);
    if (sig===prev && i>=3) break; prev=sig; }
  const me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json(); return j.email||j.username;});
  const i = cur.txt.indexOf('Settings ›');
  return {me, rounds, controls: cur.ctl, disabledCount: cur.ctl.filter(c=>c.dis).length, text: cur.txt.slice(i, i+900)};
};
