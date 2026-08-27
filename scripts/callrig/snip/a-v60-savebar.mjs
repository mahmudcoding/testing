export default async ({ page }) => {
  const vis = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
  const snap = async (tag) => await page.evaluate(([tag, visSrc]) => {
    const vis = eval(visSrc);
    const btns = [...document.querySelectorAll('button')].filter(vis)
      .map(b => ({ t: (b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24), dis: b.disabled,
                   bottom: Math.round(b.getBoundingClientRect().bottom), pos: getComputedStyle(b.closest('div')||b).position }))
      .filter(b => /save|discard|cancel|reset|revert/i.test(b.t));
    return { tag, saveish: btns, vh: innerHeight };
  }, [tag, vis]);

  const before = await snap('before');
  const ph = await page.$('input[placeholder="+1 555 0100"]');
  await ph.click();
  await page.keyboard.type('+998901112233', { delay: 40 });
  const poll = [];
  for (let i = 0; i < 10; i++) { poll.push(await snap('t' + (i*300))); await page.waitForTimeout(300); }
  return { before, after: poll[poll.length-1], firstAppear: poll.find(p => p.saveish.length > 0)?.tag ?? 'never',
           phoneValue: await page.evaluate(() => document.querySelector('input[placeholder="+1 555 0100"]')?.value) };
};
