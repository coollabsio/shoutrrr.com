export const API_BASE_URL = 'https://app.shoutrrr.com/api/v1';

/** Sidebar / reference order. Every tag in the spec must appear here. */
export const TAG_ORDER = [
  'Posts',
  'PostActions',
  'AccountSets',
  'ConnectedAccounts',
  'Media',
  'Calendar',
  'PostingSchedule',
  'Shares',
];

/** Human-facing metadata per tag. `slug` is the /docs/api/<slug> route. */
export const TAG_META = {
  Posts: { slug: 'posts', title: 'Posts', description: 'Create, read, update, and delete posts and their per-platform targets.' },
  PostActions: { slug: 'post-actions', title: 'Post actions', description: 'Schedule, queue, publish, and retry posts.' },
  AccountSets: { slug: 'account-sets', title: 'Account sets', description: 'Group connected accounts so a post can target them in one shot.' },
  ConnectedAccounts: { slug: 'connected-accounts', title: 'Connected accounts', description: 'List the social accounts connected to your workspace.' },
  Media: { slug: 'media', title: 'Media', description: 'Upload and remove images and videos used in posts.' },
  Calendar: { slug: 'calendar', title: 'Calendar', description: 'Fetch posts for a given month.' },
  PostingSchedule: { slug: 'posting-schedule', title: 'Posting schedule', description: 'Read the recurring posting-slot schedule.' },
  Shares: { slug: 'shares', title: 'Shares', description: 'Create and revoke shareable preview links for a post.' },
};
