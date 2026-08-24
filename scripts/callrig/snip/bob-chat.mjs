export default async ({page}) => {
  const t = await page.$('button[aria-label="Call chat"]');
  if (t && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const panel = await page.evaluate(() => { const p = document.querySelector('[data-testid="in-call-chat-panel"]'); return p ? p.innerText.replace(/\n+/g,' | ').slice(0,700) : 'no panel'; });
  const chans = await page.evaluate(async () => {
    const r = await fetch('/api/v1/workspaces/W4QAF1XTURESO01/channels',{credentials:'include'});
    const j = await r.json();
    return (j.channels||j||[]).map(c=>`${c.name}|${c.id}|${c.type||''}|arch=${c.is_archived}`);
  });
  return {panel, chans};
};
