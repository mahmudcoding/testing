export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/sessions`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/sessions',{credentials:'include'}); const t=await r.text();
    let n=null,cur=null; try{const p=JSON.parse(t); const a=p.sessions||p.data||[]; n=a.length;}catch{}
    return {s:r.status, count:n, sample:t.slice(0,150)};});
  const ui = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    // content area = the heading "Sessions" and everything after it, excluding nav/aside subtrees
    const heads=[...main.querySelectorAll('h1,h2')].filter(vis).filter(h=>/Sessions/.test(h.innerText||''));
    const anchor=heads[heads.length-1];
    let scope=anchor;
    for(let i=0;i<4&&scope&&scope.parentElement;i++) scope=scope.parentElement;
    const inNav=e=>!!e.closest('nav,aside');
    const inter=[...(scope||main).querySelectorAll('button,a,input,select,[role=button],[role=switch],[role=menuitem],[role=tab]')]
      .filter(vis).filter(e=>!inNav(e))
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,44)).filter(Boolean);
    const txt=((scope||main).innerText||'').replace(/\s+/g,' ');
    return { scopeText: txt.slice(0,300), contentControls: inter, n: inter.length };
  });
  return { api, ...ui };
};
