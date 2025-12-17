import { Hono } from "hono";
import type { Env } from './core-utils';
import { HashreleaseEntity, ReleaseEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { ProjectId, StepStatus } from "@shared/types";
const VALID_PROJECT_IDS: ProjectId[] = ['oss', 'enterprise'];
const VALID_STEP_STATUSES: StepStatus[] = ['pending', 'in-progress', 'done', 'error'];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure data is seeded on first load
  app.use('/api/*', async (c, next) => {
    await HashreleaseEntity.ensureSeed(c.env);
    await ReleaseEntity.ensureSeed(c.env);
    await next();
  });
  // GET all hashreleases, optionally filtered by projectId
  app.get('/api/hashreleases', async (c) => {
    const projectId = c.req.query('projectId') as ProjectId | undefined;
    const { items } = await HashreleaseEntity.list(c.env, null, 100); // Fetch all for simplicity
    const filtered = projectId ? items.filter(hr => hr.projectId === projectId) : items;
    return ok(c, filtered);
  });
  // GET all releases, optionally filtered by projectId
  app.get('/api/releases', async (c) => {
    const projectId = c.req.query('projectId') as ProjectId | undefined;
    const { items } = await ReleaseEntity.list(c.env, null, 100); // Fetch all
    const filtered = projectId ? items.filter(r => r.projectId === projectId) : items;
    return ok(c, filtered);
  });
  // GET a specific release by ID
  app.get('/api/releases/:id', async (c) => {
    const { id } = c.req.param();
    const release = new ReleaseEntity(c.env, id);
    if (!await release.exists()) return notFound(c, 'Release not found');
    return ok(c, await release.getState());
  });
  // GET a specific hashrelease by ID
  app.get('/api/hashreleases/:id', async (c) => {
    const { id } = c.req.param();
    const hashrelease = new HashreleaseEntity(c.env, id);
    if (!await hashrelease.exists()) return notFound(c, 'Hashrelease not found');
    return ok(c, await hashrelease.getState());
  });
  // PATCH to update a release step's status
  app.patch('/api/releases/:id/step', async (c) => {
    const { id } = c.req.param();
    const { stepName, status } = await c.req.json<{ stepName?: string; status?: StepStatus }>();
    if (!isStr(stepName) || !status || !VALID_STEP_STATUSES.includes(status)) {
      return bad(c, 'A valid stepName and status are required.');
    }
    const release = new ReleaseEntity(c.env, id);
    if (!await release.exists()) return notFound(c, 'Release not found');
    const updatedRelease = await release.updateStepStatus(stepName, status);
    return ok(c, updatedRelease);
  });
  // Summary endpoint for the dashboard
  app.get('/api/dashboard', async (c) => {
    const [allReleases, allHashreleases] = await Promise.all([
      ReleaseEntity.list(c.env, null, 100).then(p => p.items),
      HashreleaseEntity.list(c.env, null, 100).then(p => p.items)
    ]);
    const data = {
      oss: {
        releases: allReleases.filter(r => r.projectId === 'oss').sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5),
        hashreleases: allHashreleases.filter(hr => hr.projectId === 'oss').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      },
      enterprise: {
        releases: allReleases.filter(r => r.projectId === 'enterprise').sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5),
        hashreleases: allHashreleases.filter(hr => hr.projectId === 'enterprise').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      }
    };
    return ok(c, data);
  });
}