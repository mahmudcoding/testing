export default async ({page}) => await page.evaluate(()=>{
  const l = window.__wsLog2 || [];
  const socks = {};
  for (const x of l) { const k=x.sock; socks[k] = socks[k] || {kind:(x.url||'').includes('/rtc/')?'rtc':'chat', in:0, out:0, tokenTail:(x.url||'').slice(-24)};
    socks[k][x.dir]++; }
  return socks;
});
