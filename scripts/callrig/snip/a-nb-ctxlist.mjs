export default async ({browser}) => ({
  contexts: browser.contexts().length,
  pages: browser.contexts().flatMap(c=>c.pages().map(p=>p.url().slice(0,70)))
});
