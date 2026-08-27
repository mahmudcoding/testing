const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  const need = await page.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status !== 200);
  if (need) {
    await page.fill('input[type=email]','qa.d.outsider@aloqa.test');
    await page.fill('input[type=password]','QaPass123!');
    await page.locator('button[type=submit], button:has-text("Sign in")').first().click().catch(()=>{});
    await page.waitForTimeout(6000);
  }
  const who = await page.evaluate(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'not signed in'; const j=await r.json(); return (j.user||j).email; });
  const api = await page.evaluate(async () => {
    const out={};
    const g = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let n=null; try{ const j=JSON.parse(t); n=(j.invites||j.notifications||j.items||(Array.isArray(j)?j:[])).length; }catch{}
      return { s:r.status, n, sample:t.slice(0,220) }; };
    out.pendingInvites = await g('/api/v1/workspace-invites');
    out.notifications  = await g('/api/v1/notifications?limit=10');
    out.myWorkspaces   = await g('/api/v1/users/me/workspaces');
    return out;
  });
  // what does the app SHOW them?
  await page.goto('https://airion-cargo.store/', { waitUntil:'networkidle' });
  await page.waitForTimeout(4000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const t=(document.body.innerText||'').replace(/\\n+/g,' | ');
    const btns=[...document.querySelectorAll('button,a')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,18);
    return { url: location.pathname, textStart: t.slice(0,280), controls: btns,
             mentionsInvite: /invit/i.test(t), mentionsWorkspaceD: /QA Workspace D/.test(t) }; })()`);
  return { signedInAs: who, api, ui };
};
