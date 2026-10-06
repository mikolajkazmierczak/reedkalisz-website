// A page split into subpages shows them as tabs in the header: [{ label, path, status }] -> [{ label, href, active,
// status }]. `query` (e.g. "?c=2") goes along, so a choice shared by the tabs (a company) carries over.
// `status`: [{ label, count }] - what to look at in that tab (an orange outline, "label: **count**" on hover)
export const headerTabs = (pathname, tabs, query = '') =>
  tabs.map(({ label, path, status = null }) => ({ label, href: path + query, active: pathname === path, status }));
