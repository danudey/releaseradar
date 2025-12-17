import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Hashrelease, Release, ProjectId } from '@shared/types';
import { HashreleaseCard, ReleaseCard, ProjectIcon } from '@/components/release-widgets';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const PageSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-10 w-full max-w-sm" />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
    </div>
  </div>
);
export function ProjectPage() {
  const { projectId } = useParams<{ projectId: ProjectId }>();
  const { data: releases, isLoading: releasesLoading, error: releasesError } = useQuery<Release[]>({
    queryKey: ['releases', projectId],
    queryFn: () => api(`/api/releases?projectId=${projectId}`),
    enabled: !!projectId,
  });
  const { data: hashreleases, isLoading: hashreleasesLoading, error: hashreleasesError } = useQuery<Hashrelease[]>({
    queryKey: ['hashreleases', projectId],
    queryFn: () => api(`/api/hashreleases?projectId=${projectId}`),
    enabled: !!projectId,
  });
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const branches = useMemo(() => {
    const allBranches = new Set<string>();
    if (releases) releases.forEach(r => allBranches.add(r.branch));
    if (hashreleases) hashreleases.forEach(hr => allBranches.add(hr.branch));
    return ['all', ...Array.from(allBranches).sort()];
  }, [releases, hashreleases]);
  const filteredReleases = useMemo(() => {
    if (!releases) return [];
    if (selectedBranch === 'all') return releases;
    return releases.filter(r => r.branch === selectedBranch);
  }, [releases, selectedBranch]);
  const filteredHashreleases = useMemo(() => {
    if (!hashreleases) return [];
    if (selectedBranch === 'all') return hashreleases;
    return hashreleases.filter(hr => hr.branch === selectedBranch);
  }, [hashreleases, selectedBranch]);
  const isLoading = releasesLoading || hashreleasesLoading;
  const error = releasesError || hashreleasesError;
  const projectName = projectId === 'oss' ? 'Open Source' : 'Enterprise';
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Mission Control</Link>
          </Button>
          <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tighter text-foreground">
            <ProjectIcon projectId={projectId!} className="h-10 w-10" />
            {projectName}
          </h1>
        </div>
        {isLoading && <PageSkeleton />}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load project data.</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && (
          <Tabs defaultValue="releases" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="releases">Releases</TabsTrigger>
                <TabsTrigger value="hashreleases">Hashreleases</TabsTrigger>
              </TabsList>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch === 'all' ? 'All Branches' : branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TabsContent value="releases">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredReleases.map(release => <ReleaseCard key={release.id} release={release} />)}
              </div>
              {filteredReleases.length === 0 && <p className="text-muted-foreground mt-4">No releases found for this branch.</p>}
            </TabsContent>
            <TabsContent value="hashreleases">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredHashreleases.map(hr => <HashreleaseCard key={hr.id} hashrelease={hr} />)}
              </div>
              {filteredHashreleases.length === 0 && <p className="text-muted-foreground mt-4">No hashreleases found for this branch.</p>}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}