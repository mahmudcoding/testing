export default async ({page}) => {
  await page.goto('http://localhost:8765/', {waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  const dir='/private/tmp/claude-501/-Users-mahmud-Projects-testing/ea7548f3-2f65-44bb-af90-5caa1d521e16/scratchpad/';
  const h = await page.evaluate(()=>document.documentElement.scrollHeight);
  const shots=[];
  for (const [i,y] of [1100, 3050, 5750, 7450].entries()) {
    await page.evaluate(yy=>window.scrollTo(0,yy), y);
    await page.waitForTimeout(700);
    await page.screenshot({path: dir+`rep${i}.png`});
    shots.push(`rep${i}.png @${y}`);
  }
  const overflow = await page.evaluate(()=>({x: document.documentElement.scrollWidth > window.innerWidth,
    clipped: [...document.querySelectorAll('pre,td,h1,h2,h3')].filter(e=>e.scrollWidth>e.clientWidth+2).length}));
  return {h, shots, overflow};
};
