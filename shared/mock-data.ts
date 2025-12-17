import { Hashrelease, Release, ProjectId } from './types';
import { subDays, formatISO } from 'date-fns';
const generateId = () => crypto.randomUUID().slice(0, 7);
const createHashrelease = (projectId: ProjectId, branch: string, daysAgo: number, buildSuccess: boolean, testSuccess: boolean, isReady: boolean, version: string): Hashrelease => ({
  id: generateId(),
  projectId,
  branch,
  version,
  buildSuccess,
  testSuccess,
  isReadyForRelease: isReady,
  componentVersions: {
    api: `1.${daysAgo}.0`,
    ui: `2.${daysAgo}.1`,
    operator: `0.${daysAgo}.5`,
  },
  createdAt: formatISO(subDays(new Date(), daysAgo)),
});
const createRelease = (projectId: ProjectId, branch: string, hashreleaseId: string, version: string, daysAgo: number, isComplete: boolean): Release => ({
  id: version,
  projectId,
  branch,
  hashreleaseId,
  version,
  releaseManager: 'Alice',
  startedAt: formatISO(subDays(new Date(), daysAgo)),
  completedAt: isComplete ? formatISO(subDays(new Date(), daysAgo - 1)) : undefined,
  lifecycle: [
    { name: 'Started', status: 'done' },
    { name: 'Images Published', status: isComplete ? 'done' : 'in-progress' },
    { name: 'Artifacts Published', status: isComplete ? 'done' : 'pending' },
    { name: 'Operator Published', status: 'pending' },
    { name: 'Release Validated', status: 'pending' },
    { name: 'Docs Merged', status: 'pending' },
  ],
});
// --- Open Source Data ---
export const MOCK_OSS_HASHRELEASES: Hashrelease[] = [
  createHashrelease('oss', 'release-2.5', 1, true, true, true, '2.5.1'),
  createHashrelease('oss', 'release-2.5', 2, true, false, false, '2.5.1-rc2'),
  createHashrelease('oss', 'release-2.5', 3, false, false, false, '2.5.1-rc1'),
  createHashrelease('oss', 'release-2.4', 10, true, true, true, '2.4.3'),
];
export const MOCK_OSS_RELEASES: Release[] = [
  createRelease('oss', 'release-2.5', MOCK_OSS_HASHRELEASES[0].id, 'v2.5.0', 5, false),
  createRelease('oss', 'release-2.4', MOCK_OSS_HASHRELEASES[3].id, 'v2.4.2', 12, true),
];
// --- Enterprise Data ---
export const MOCK_ENTERPRISE_HASHRELEASES: Hashrelease[] = [
  createHashrelease('enterprise', 'release-3.1', 0, false, false, false, '3.1.0-rc3'),
  createHashrelease('enterprise', 'release-3.1', 1, true, true, true, '3.1.0-rc2'),
  createHashrelease('enterprise', 'release-3.1', 2, true, true, true, '3.1.0-rc1'),
  createHashrelease('enterprise', 'release-3.0', 20, true, true, true, '3.0.5'),
];
export const MOCK_ENTERPRISE_RELEASES: Release[] = [
  createRelease('enterprise', 'release-3.1', MOCK_ENTERPRISE_HASHRELEASES[1].id, 'v3.1.0', 1, false),
  createRelease('enterprise', 'release-3.0', MOCK_ENTERPRISE_HASHRELEASES[3].id, 'v3.0.4', 22, true),
];
export const MOCK_HASHRELEASES = [...MOCK_OSS_HASHRELEASES, ...MOCK_ENTERPRISE_HASHRELEASES];
export const MOCK_RELEASES = [...MOCK_OSS_RELEASES, ...MOCK_ENTERPRISE_RELEASES];