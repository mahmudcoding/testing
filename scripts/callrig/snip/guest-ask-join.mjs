export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3000);
  await p.fill('input[type=text]','SideRoom Guest');
  await p.waitForTimeout(600);
  await p.locator('button', {hasText:/Ask to join|Join call/}).first().click();
  await p.waitForTimeout(5000);
  return await p.evaluate(()=>({body: document.body.innerText.replace(/\n+/g,' | ').slice(0,250)}));
};
