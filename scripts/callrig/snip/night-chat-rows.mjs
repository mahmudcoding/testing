export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(async () => {
    const panel = document.querySelector('[data-testid="in-call-chat-panel"]');
    const rows = [...document.querySelectorAll('[data-testid="ic-user-message"]')].map(r=>({
      text: r.innerText.replace(/\n+/g,' | ').slice(0,180),
      buttons: [...r.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32))
    }));
    const api = await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/messages?limit=50',{credentials:'include'})).json();
    return {
      panelText: panel?panel.innerText.replace(/\n+/g,' | ').slice(0,500):null,
      rows,
      apiMessages: (api.messages||[]).map(m=>({body:m.body, reply_count:m.reply_count, author:m.author&&m.author.name}))
    };
  });
};
