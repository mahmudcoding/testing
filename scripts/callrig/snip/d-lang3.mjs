export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  const setLang = async (target) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    const btn = page.locator('main button').filter({hasText:/^(English|Russian|Русский|Uzbek)$/}).first();
    await btn.click(); await page.waitForTimeout(2000);
    const item = page.locator('[role="dialog"],div').filter({hasText:/^English\s*Russian/}).locator('*').filter({hasText:new RegExp('^'+target+'$')}).last();
    let clicked=false;
    try { await item.click({timeout:6000}); clicked=true; } catch(e) {
      try { await page.getByText(target,{exact:true}).last().click({timeout:6000}); clicked=true; } catch(e2){}
    }
    await page.waitForTimeout(4000);
    return clicked;
  };
  res.toRussian = await setLang('Russian');
  const sweep = async () => {
    const out=[];
    for (const p of ['settings/account','settings/privacy','settings/security','settings/sessions','settings/notifications','settings/about','settings/workspace']) {
      await page.goto(`https://airion-cargo.store/w/${WS}/${p}`, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(3000);
      const d = await page.evaluate(()=>{
        const m=document.querySelector('main');
        const t=(m.innerText||'').replace(/\s+/g,' ').trim();
        const cyr=(t.match(/[А-Яа-яЁё]/g)||[]).length, lat=(t.match(/[A-Za-z]/g)||[]).length;
        // English-looking sentences left behind (3+ latin words in a row)
        const leftovers=(t.match(/\b[A-Z][a-z]+(?:\s+[a-z]{2,}){2,}[.,]?/g)||[]).slice(0,6);
        return {cyr, lat, leftovers};
      });
      out.push({page:p, ...d});
    }
    return out;
  };
  res.sweep = await sweep();
  res.backToEnglish = await setLang('English');
  res.finalLang = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Language');return t.slice(i,i+60);});
  return res;
};
