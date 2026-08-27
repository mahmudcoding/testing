const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// ALK-3117 / ALK-2784: does AUTH_PROFILE_UPDATE_TOO_SOON reach the user, and how is it worded?
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onResp = async r => { const m=r.request().method();
    if (m==='GET' || !/\/api\//.test(r.url())) return;
    let b=''; try{ b=(await r.text()).slice(0,220);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,52)} -> ${r.status()} ${b}`); };
  page.on('response', onResp);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { name:a.name, username:a.username };})()`);
  // type a new display name into the Display name field
  const typed = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(i=>i.type!=='search');
    // Display name is the field whose current value matches the account name
    const target=ins.find(i=>/QA /.test(i.value)) || ins[0];
    if(!target) return {ok:false, count:ins.length};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(target,'QA Alice R');
    target.dispatchEvent(new Event('input',{bubbles:true}));
    return {ok:true, was:target.defaultValue||'', now:target.value}; })()`);
  await page.waitForTimeout(1200);
  net.length=0;
  const saved = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(4000);
  const shown = await page.evaluate(`(() => { const vis=(${VIS});
    const nodes=[...document.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
      .filter(t=>t.length>3 && t.length<220)
      .filter(t=>/error|fail|too soon|wait|limit|попроб|ошиб|позже|Could not|cannot|unable/i.test(t));
    return [...new Set(nodes)].slice(0,6); })()`);
  const after = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { name:a.name };})()`);
  page.off('response', onResp);
  return { before, typed, saved, requests:[...net].slice(0,4), messagesOnScreen:shown, nameAfter:after.name,
           nameChanged: before.name!==after.name };
};
