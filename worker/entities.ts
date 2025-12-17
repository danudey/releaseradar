import { IndexedEntity } from "./core-utils";
import type { Hashrelease, Release, StepStatus } from "@shared/types";
import { MOCK_HASHRELEASES, MOCK_RELEASES } from "@shared/mock-data";
import { formatISO } from "date-fns";
export class HashreleaseEntity extends IndexedEntity<Hashrelease> {
  static readonly entityName = "hashrelease";
  static readonly indexName = "hashreleases";
  static readonly initialState: Hashrelease = {
    id: "",
    projectId: "oss",
    branch: "",
    version: "",
    buildSuccess: false,
    testSuccess: false,
    isReadyForRelease: false,
    componentVersions: {},
    createdAt: "",
  };
  static seedData = MOCK_HASHRELEASES;
}
export class ReleaseEntity extends IndexedEntity<Release> {
  static readonly entityName = "release";
  static readonly indexName = "releases";
  static readonly initialState: Release = {
    id: "",
    projectId: "oss",
    branch: "",
    hashreleaseId: "",
    version: "",
    releaseManager: "",
    startedAt: "",
    lifecycle: [],
  };
  static seedData = MOCK_RELEASES;
  async updateStepStatus(stepName: string, status: StepStatus): Promise<Release> {
    return this.mutate(release => {
      const newLifecycle = release.lifecycle.map(step => {
        if (step.name === stepName) {
          const now = formatISO(new Date());
          const updatedStep = { ...step, status };
          if (status === 'in-progress' && !step.startedAt) {
            updatedStep.startedAt = now;
          }
          if (status === 'done' && !step.completedAt) {
            updatedStep.completedAt = now;
          }
          return updatedStep;
        }
        return step;
      });
      return { ...release, lifecycle: newLifecycle };
    });
  }
}