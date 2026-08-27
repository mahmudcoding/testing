const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const FILE = process.env.D2_FILE;
  const net=[];
  page.on('response', async r => { const u=r.url(); if(r.request().method()==='GET') return;
    if(!/avatar|upload|file|auth\/me|profile/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,46)} -> ${r.status()} ${b.slice(0,120)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return { avatar: u.avatar_url ?? u.avatar ?? '(no avatar field)' , keys:Object.keys(u).filter(k=>/avatar|image|photo/i.test(k)) }; });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const input = page.locator('input[type=file]').first();
  const found = await input.count();
  if (found) await input.setInputFiles(FILE).catch(e=>{ notices.push('setInputFiles: '+e.message.slice(0,60)); });
  await page.waitForTimeout(6000);
  clearInterval(poll);
  const after = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return { avatar: u.avatar_url ?? u.avatar ?? '(no avatar field)' }; });
  const dialog = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return d ? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,200) : '(no dialog)'; })()`);
  return { file: FILE, fileInputFound: found, avatarBefore: before, avatarAfter: after,
           requests: net, notices, dialog };
};
