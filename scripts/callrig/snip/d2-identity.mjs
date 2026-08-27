export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u = r.url(); if (!u.includes('/api/v1/')) return;
    let b=''; try { b = (await r.text()).slice(0,500); } catch {}
    net.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(), req:(r.request().postData()||'').slice(0,400), res:b }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const setByLabel = async (label, value) => {
    const h = await page.evaluateHandle(([lbl]) => {
      const ins = [...document.querySelectorAll('main input,main textarea')];
      return ins.find(e => {
        let l = e.getAttribute('aria-label') || '';
        if (!l && e.id) { const x = document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if (x) l = x.innerText.trim(); }
        return l === lbl;
      }) || null;
    }, [label]);
    const el = h.asElement(); if (!el) return 'not found';
    await el.scrollIntoViewIfNeeded(); await el.fill(value); await page.waitForTimeout(200);
    return await el.inputValue();
  };
  const filled = {};
  filled['Job title'] = await setByLabel('Job title', 'QA Engineer');
  filled['Department'] = await setByLabel('Department', 'Quality');
  filled['Pronouns'] = await setByLabel('Pronouns', 'they/them');
  filled['Status message'] = await setByLabel('Status message', 'Testing profile fields');

  net.length = 0;
  const save = page.locator('button:has-text("Save profile")').first();
  const had = await save.count();
  if (had) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(4000); }

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const readback = await page.evaluate(() => {
    const g = lbl => { const ins=[...document.querySelectorAll('main input,main textarea')];
      const e = ins.find(x => { let l=x.getAttribute('aria-label')||''; if(!l&&x.id){const y=document.querySelector('label[for="'+CSS.escape(x.id)+'"]');if(y)l=y.innerText.trim();} return l===lbl; });
      return e ? e.value : '(missing)'; };
    return { job:g('Job title'), dept:g('Department'), pron:g('Pronouns'), status:g('Status message'), name:g('Display name') };
  });
  return { filled, saveButtonPresent: had,
    saveRequests: net.filter(n=>n.m!=='GET').map(n=>`${n.m} ${n.u} -> ${n.s}`),
    saveBody: net.filter(n=>n.req).map(n=>n.req)[0] || '',
    readbackAfterReload: readback };
};
