const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/invite/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,46)} -> ${r.status()} ${b.slice(0,140)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  // the page's own promise, verbatim
  const promise = await page.evaluate(`(() => { const t=(document.querySelector('main')||document.body).innerText;
    return (t.match(/.{0,10}in-app inbox.{0,40}/)||[''])[0].trim(); })()`);
  // pick the recipient checkbox for the company-only account
  const pickByText = async frag => (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis).find(e => { let p=e.parentElement;
      for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1 && (p.innerText||'').includes(${'`'}\${JSON.stringify(frag)}${'`'})) return true; p=p.parentElement; } return false; }) || null; })()`)).asElement();
  const rec = await pickByText('qa_d_outsider');
  const found = rec ? 1 : 0;
  let sent=null;
  if (found) {
    await rec.scrollIntoViewIfNeeded();
    if (!(await rec.evaluate(e=>e.checked===true))) { await rec.click(); await page.waitForTimeout(700); }
    const checked = await rec.evaluate(e=>e.checked===true);
    // choose "Invite without a role" so no role is needed
    const noRole = await pickByText('Invite without a role');
    if (noRole && !(await noRole.evaluate(e=>e.checked===true))) { await noRole.scrollIntoViewIfNeeded(); await noRole.click(); await page.waitForTimeout(600); }
    net.length=0;
    const send = page.locator('button:has-text("Send direct invites")').first();
    const dis = await send.isDisabled();
    if (!dis) { await send.scrollIntoViewIfNeeded(); await send.click(); await page.waitForTimeout(5000); }
    sent = { recipientChecked: checked, sendDisabled: dis, requests: [...net],
      notices: await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
          .map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,4); })()`) };
  }
  return { pagePromise: promise, recipientFound: found, sent };
};
