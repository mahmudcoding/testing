export default async ({page}) => {
  const before = await page.evaluate(()=>({
    preJoin: /READY TO JOIN/i.test(document.body.innerText),
    text: (document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200)
  }));
  const reqs = [];
  page.on('request', r => { if (!/_next|\.woff|\.css|\.js|\/api\/rum/.test(r.url())) reqs.push(r.method()+' '+r.url().replace(/^https:\/\/[^/]+/,'')); });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0,120)));
  page.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text().slice(0,120)); });
  await page.getByRole('button', { name: /^Join$/ }).first().click({timeout:8000}).catch(e=>errs.push('click: '+e.message.split('\n')[0]));
  await page.waitForTimeout(9000);
  return { before, afterPreJoin: await page.evaluate(()=>/READY TO JOIN/i.test(document.body.innerText)),
           requests: reqs.slice(0,15), errors: errs.slice(0,6),
           pcs: await page.evaluate(()=>(window.__pcs||[]).length) };
};
