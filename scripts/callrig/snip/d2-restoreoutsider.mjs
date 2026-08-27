const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const btn = page.locator('button[aria-label="Remove QA Outsider from this workspace"]').first();
  out.removeButtonFound = await btn.count();
  if (out.removeButtonFound) {
    await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(2200);
    out.dialog = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis)[0];
      return d ? { text:(d.innerText||'').replace(/\\n/g,' | ').slice(0,180),
        buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean) } : '(no dialog)'; })()`);
    for (const sel of ['[role=dialog] button:has-text("Remove")','[role=alertdialog] button:has-text("Remove")','button:has-text("Remove member")']) {
      const c = page.locator(sel).last();
      if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(3500); break; }
    }
  }
  // revoke the invite and confirm state
  out.finalState = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const inv = await (await fetch('/api/v1/workspace-invites?workspace_id='+W,{credentials:'include'})).json().catch(()=>({}));
    const list = (inv && (inv.invites||inv.items)) || [];
    const revoked = [];
    for (const i of list) { const r = await fetch(`/api/v1/workspaces/invites/${i.id}/revoke`,{method:'POST',credentials:'include'}); revoked.push(i.id.slice(0,6)+'->'+r.status); }
    const m = await (await fetch(`/api/v1/workspaces/${W}/members?limit=50`,{credentials:'include'})).json();
    const arr = m.members||m.items||[];
    return { invitesRevoked: revoked, workspaceMemberCount: arr.length,
             outsiderStillInWorkspace: arr.some(x=>x.user_id==='U4QDOUTSIDER001'),
             names: arr.map(x=>x.name) };
  });
  return out;
};
