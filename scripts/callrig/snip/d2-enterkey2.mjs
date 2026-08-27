const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let body=''; try{ body=r.request().postData()||''; }catch{}
    let resp=''; try{ resp=(await r.text()).slice(0,90); }catch{}
    net.push({ m:r.request().method(), u:u.slice(0,34), sent:body.slice(0,260), status:r.status(), resp }); });
  const run = async (useEnter) => {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2700);
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const i=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)[0]; i.focus(); })()`);
    await page.keyboard.type('+998901234567', { delay: 22 });
    await page.waitForTimeout(900);
    net.length=0;
    if (useEnter) { await page.keyboard.press('Enter'); }
    else {
      await page.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
        if(b.length) b[0].click(); })()`);
    }
    await page.waitForTimeout(3200);
    const after = await page.evaluate(`(() => { const vis=(${VIS});
      return { bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
    const stored = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).settings.contacts);
    // reset
    await page.evaluate(async () => { const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
      const s=cur.settings||{};
      await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...s, contacts:{phone:'',github:'',website:'',linkedin:''}})}); });
    return { requests:[...net], barAfter:after.bar, storedPhone:stored.phone };
  };
  const withEnter = await run(true);
  const withButton = await run(false);
  return { withEnter, withButton };
};
