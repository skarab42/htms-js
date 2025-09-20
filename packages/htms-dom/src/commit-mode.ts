export const commitModes = ['replace', 'content', 'append', 'prepend', 'before', 'after'] as const;

export type CommitModes = typeof commitModes;
export type CommitMode = CommitModes[number];

export const defaultCommitMode: CommitMode = 'replace';

export function isCommitMode(commit: string | null): commit is CommitMode {
  return commitModes.includes(commit as CommitMode);
}
