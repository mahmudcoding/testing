export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const armed = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    if (!dlg) return false;
    // the list container: the ancestor holding the member checkboxes
    const cbs = [...dlg.querySelectorAll('input[type=checkbox]')];
    if (!cbs.length) return false;
    let root = cbs[0];
    for (let i=0;i<8 && root.parentElement;i++){ root=root.parentElement;
      if (root.querySelectorAll('input[type=checkbox]').length === cbs.length) break; }
    window.__mut = { added:0, removed:0, attrs:0, batches:0, t0: performance.now(), samples: [] };
    const obs = new MutationObserver(muts => {
      window.__mut.batches++;
      for (const m of muts) {
        window.__mut.added += m.addedNodes.length;
        window.__mut.removed += m.removedNodes.length;
        if (m.type === 'attributes') window.__mut.attrs++;
      }
      window.__mut.samples.push(Math.round(performance.now() - window.__mut.t0));
    });
    obs.observe(root, { childList:true, subtree:true, attributes:true });
    window.__obs = obs;
    return { checkboxes: cbs.length };
  });
  if (!armed) return { error: 'invite list not found' };
  await page.waitForTimeout(35000);
  const res = await page.evaluate(() => { window.__obs && window.__obs.disconnect();
    const m = window.__mut; return { batches:m.batches, added:m.added, removed:m.removed,
      attrs:m.attrs, firstTimestamps: m.samples.slice(0,12), totalSamples: m.samples.length }; });
  return { armed, over20s: res };
};
