const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/invite/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,46)} -> ${r.status()} ${b.slice(0,150)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);

  const pick = async frag => {
    const fn = '(() => { const vis = ' + VIS + '; const FRAG = ' + JSON.stringify(frag) + ';'
      + ' return [...document.querySelectorAll("main input")].filter(vis).find(e => { let p = e.parentElement;'
      + ' for (let i=0;i<5&&p;i++){ if (p.querySelectorAll("input").length===1 && (p.innerText||"").includes(FRAG)) return true; p=p.parentElement; } return false; }) || null; })()';
    return (await page.evaluateHandle(fn)).asElement();
  };
  const promise = await page.evaluate(`(() => { const t=(document.querySelector('main')||document.body).innerText;
    return (t.match(/[^|.]*in-app inbox[^.]*\\./)||[''])[0].trim(); })()`);
  const rec = await pick('qa_d_outsider');
  if (!rec) return { pagePromise: promise, err: 'recipient control not found' };
  await rec.scrollIntoViewIfNeeded();
  if (!(await rec.evaluate(e=>e.checked===true))) { await rec.click(); await page.waitForTimeout(800); }
  const recChecked = await rec.evaluate(e=>e.checked===true);
  const noRole = await pick('Invite without a role');
  if (noRole && !(await noRole.evaluate(e=>e.checked===true))) { await noRole.scrollIntoViewIfNeeded(); await noRole.click(); await page.waitForTimeout(700); }
  const noRoleChecked = noRole ? await noRole.evaluate(e=>e.checked===true) : null;
  net.length = 0;
  const send = page.locator('button:has-text("Send direct invites")').first();
  const dis = await send.isDisabled();
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  if (!dis) { await send.scrollIntoViewIfNeeded(); await send.click(); await page.waitForTimeout(5500); }
  clearInterval(poll);
  return { pagePromise: promise, recipientChecked: recChecked, noRoleChecked, sendDisabled: dis,
           requests: net, notices };
};
