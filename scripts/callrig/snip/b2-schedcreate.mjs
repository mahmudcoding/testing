export default async ({ page }) => {
  const title = process.env.QA_TITLE || 'QA sched start';
  const set = await page.evaluate(t => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const inp = d && [...d.querySelectorAll('input')].filter(v).find(i=>i.getAttribute('placeholder')==='Add title');
    if (!inp) return 'no title field';
    const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    s.call(inp, t); inp.dispatchEvent(new Event('input',{bubbles:true}));
    return inp.value; }, title);
  await page.waitForTimeout(700);
  const allButtons = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    return [...d.querySelectorAll('button')].filter(v)
      .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22), disabled:b.disabled }))
      .filter(b=>b.t); });
  const net = [];
  page.on('response', async r => { if (/calendar\/meetings/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,200); } catch {}
    net.push({ st:r.status(), body:b }); } });
  const saved = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const b = [...d.querySelectorAll('button')].filter(v)
      .find(x=>/^(Schedule meeting|Schedule|Create|Save|Done)$/i.test((x.innerText||'').trim()));
    if (!b) return 'no save button'; if (b.disabled) return 'save disabled';
    b.click(); return b.innerText.trim(); });
  await page.waitForTimeout(5000);
  return { titleSet: set, saveAction: saved, net, buttons: allButtons.slice(-8) };
};
