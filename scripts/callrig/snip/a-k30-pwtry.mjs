/* At the password gate: try a wrong password, capture the response and the notice,
   then try the correct one. Poll notices from before each submit. */
export default async ({ page }) => {
  const out = {};
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 400); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData()||'').slice(0,200), res: b });
  });

  const DOM = () => {
    window.__k = {
      vis: (e) => {
        const r = e.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return false;
        let n = e, op = 1;
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          op *= parseFloat(cs.opacity || '1');
          n = n.parentElement;
        }
        return op > 0.05;
      },
      snap: () => {
        const gate = document.querySelector('[data-testid="call-password-gate"]');
        const nodes = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && window.__k.vis(e));
        const txt = nodes.map(e => e.textContent.trim()).filter(Boolean);
        const btn = [...document.querySelectorAll('button[type=submit]')].find(window.__k.vis);
        const inp = document.querySelector('[data-testid="call-password-input"]');
        return {
          gatePresent: !!gate,
          gateText: gate ? gate.innerText.replace(/\n{2,}/g,'\n').slice(0,400) : null,
          submitDisabled: btn ? (btn.disabled || btn.getAttribute('aria-disabled')==='true') : null,
          inputValueLen: inp ? inp.value.length : null,
          errorish: [...new Set(txt.filter(t => /wrong|incorrect|invalid|error|try again|password|denied|failed/i.test(t)))].slice(0,12),
          url: location.pathname,
        };
      },
    };
  };
  await page.evaluate(DOM);

  const inp = page.locator('[data-testid="call-password-input"]');
  out.beforeAnyInput = await page.evaluate(() => window.__k.snap());

  // ---- wrong password
  await inp.fill('WrongPass1');
  await page.waitForTimeout(400);
  out.afterTypingWrong = await page.evaluate(() => window.__k.snap());
  // poll from before the submit
  const poll = [];
  const t0 = Date.now();
  await page.locator('button[type=submit]').first().click();
  while (Date.now() - t0 < 9000) {
    poll.push({ t: Date.now() - t0, ...(await page.evaluate(() => window.__k.snap())) });
    await page.waitForTimeout(400);
  }
  out.wrongPoll = poll.filter((p,i)=> i===0 || i===poll.length-1 || p.errorish.length !== poll[i-1].errorish.length
                                     || p.gatePresent !== poll[i-1].gatePresent);
  out.wrongAllErrorish = [...new Set(poll.flatMap(p=>p.errorish))];
  out.apiAfterWrong = seen.slice();

  return out;
};
