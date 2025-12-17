export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type ProjectId = 'oss' | 'enterprise';
export type StepStatus = 'pending' | 'in-progress' | 'done' | 'error';
export interface ReleaseStep {
  name: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
}
export interface Hashrelease {
  id: string; // e.g., commit hash
  projectId: ProjectId;
  branch: string;
  version: string; // The version it would be if released
  buildSuccess: boolean;
  testSuccess: boolean;
  isReadyForRelease: boolean;
  componentVersions: Record<string, string>; // e.g., { "api": "1.2.3", "ui": "2.3.4" }
  createdAt: string;
}
export interface Release {
  id: string; // e.g., v2.4.1
  projectId: ProjectId;
  branch: string;
  hashreleaseId: string;
  version: string;
  releaseManager: string;
  startedAt: string;
  completedAt?: string;
  lifecycle: ReleaseStep[];
}