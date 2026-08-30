/* Submit the Start-a-call dialog with entry mode = Password and the password field EMPTY.
   Capture the API traffic and the resulting screen. */
export default async ({ page }) => {
  const out = { api: [], notices: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u)) return;
    if (r.request().method() === 'GET') return;
    let body = null;
    try { body = (await r.text()).slice(0, 700); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData() || '').slice(0, 500), res: body });
  });

  // confirm we are still in the dialog with password mode selected and an empty field
  out.pre = await page.evaluate(() => {
    const pw = [...document.querySelectorAll('input[type=password]')].find(e => e.offsetParent !== null);
    const radio = [...document.querySelectorAll('input[type=radio]')].find(e => e.value === 'password');
    return { pwPresent: !!pw, pwValue: pw ? pw.value : null, passwordModeChecked: radio ? radio.checked : null };
  });
  if (!out.pre.passwordModeChecked) { out.abort = 'password mode not selected'; return out; }

  await page.locator('[data-testid="calls-start-submit"]').click();
  await page.waitForTimeout(5000);

  out.api = seen;
  out.url = page.url();
  out.callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;
  out.screen = await page.evaluate(() => {
    const vis = (e) => {
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
    };
    const dlgOpen = !!document.querySelector('[data-testid="calls-start-dialog-body"]');
    // any error/notice text, by role OR inline
    const notices = [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[aria-live],p,span,div')]
      .filter(e => vis(e) && e.children.length === 0)
      .map(e => e.textContent.trim())
      .filter(t => t && /password|error|required|enter|invalid|try again|wrong/i.test(t));
    return { dlgOpen, notices: [...new Set(notices)].slice(0, 20),
             heads: [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(e=>e.textContent.trim()).slice(0,6) };
  });
  return out;
};
