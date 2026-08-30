export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const prev = [];
  gp.on('response', async (r) => {
    if (!/\/api\/guest\/preview/.test(r.url())) return;
    let b=null; try { b=await r.text(); } catch {}
    prev.push({ s:r.status(), body:b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  const st = await gp.evaluate(() => ({ url: location.pathname,
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,300),
    inputs: [...document.querySelectorAll('input')].length,
    buttons: [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,8) }));
  await gctx.close();
  return { preview: prev, page: st };
};
