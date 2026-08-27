export default async ({page}) => {
  const secs=['account','privacy','appearance','notifications','sessions','about'];
  const out=[];
  for (const s of secs){
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/'+s,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    const t=await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | '));
    const hit=/diagnos|statistic|nerd|stats/i.test(t);
    out.push({section:s, mentionsStats:hit, sample: hit ? (t.match(/.{0,60}(diagnos|statistic|nerd|stats).{0,80}/i)||[])[0] : t.slice(0,90)});
  }
  return out;
};
