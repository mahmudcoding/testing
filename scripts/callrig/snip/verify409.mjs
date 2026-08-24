export default async ({page}) => {
  const cur = await page.evaluate(async()=> (await (await fetch('/api/v1/meetings/current',{credentials:'include'})).text()).slice(0,300));
  const active = await page.evaluate(async()=> (await (await fetch('/api/v1/workspace/W4QAF1XTURESO01/meetings/active',{credentials:'include'})).text()).slice(0,400));
  const ui = await page.evaluate(()=>({
    pip: !!document.querySelector('[data-testid*="pip" i],[data-testid*="minimized" i]'),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,500)
  }));
  return {cur, active, ui};
};
