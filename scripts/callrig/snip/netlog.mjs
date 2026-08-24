export default async ({page}) => {
  const seen = [];
  page.on('request', r => { const u=r.url(); if (u.includes('/api/v1/')) seen.push(r.method()+' '+u.replace('https://airion-cargo.store','')); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return [...new Set(seen)].slice(0,40);
};
