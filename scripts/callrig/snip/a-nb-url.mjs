export default async ({page}) => ({url: page.url(), path: await page.evaluate(()=>location.pathname)});
