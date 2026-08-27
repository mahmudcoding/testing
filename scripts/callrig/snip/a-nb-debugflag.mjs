export default async ({page}) => await page.evaluate(()=>({
  url: location.href.slice(0,120),
  ls: Object.keys(localStorage).filter(k=>/debug|diag|flag|dev|monitor/i.test(k))
        .map(k=>k+'='+String(localStorage.getItem(k)).slice(0,40)),
  lsAll: Object.keys(localStorage).slice(0,25)
}));
