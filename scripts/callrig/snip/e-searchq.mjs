export default async ({page}) => {
  const out={};
  const inp = page.locator('[role=dialog] input').first();
  if(!(await inp.count())) return {err:'search dialog closed'};
  const run = async (q, ms=2600) => {
    await inp.fill(''); await page.waitForTimeout(300);
    await inp.fill(q); await page.waitForTimeout(ms);
    return await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');
      return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,650):null;});
  };
  out.q_qa = await run('qa');
  out.q_image = await run('qa-e-image');
  out.q_alice = await run('alice');
  out.q_none = await run('zzqqxx99');
  return out;
};
