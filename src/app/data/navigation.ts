export interface NavLink {
  path: string;
  label: string;
  /** Shown in the mobile drawer and the command palette. */
  hint: string;
  icon: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { path: '/roadmap', label: 'Roadmap', hint: 'The full path, stage by stage', icon: 'map' },
  { path: '/learn', label: 'Learn', hint: 'Every module and topic', icon: 'book' },
  { path: '/projects', label: 'Projects', hint: 'Fifteen projects, beginner to expert', icon: 'layers' },
  { path: '/interview', label: 'Interview', hint: 'Question bank with practice mode', icon: 'target' },
  { path: '/glossary', label: 'Glossary', hint: 'Every term, defined twice', icon: 'terminal' },
  { path: '/resources', label: 'Resources', hint: 'Documentation, papers, courses', icon: 'link' },
];

export const SECONDARY_NAV: NavLink[] = [
  { path: '/now', label: 'What to learn now', hint: 'Dated, reviewed, with sources', icon: 'sparkle' },
  { path: '/dashboard', label: 'Dashboard', hint: 'Your progress and next topic', icon: 'chart' },
  { path: '/bookmarks', label: 'Bookmarks', hint: 'Everything you saved', icon: 'bookmark' },
  { path: '/about', label: 'About', hint: 'What this is and how it is built', icon: 'info' },
];

export const ALL_NAV: NavLink[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
