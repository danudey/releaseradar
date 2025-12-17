import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Hashrelease, Release, ProjectId } from '@shared/types';
import { HashreleaseCard, ReleaseCard, ProjectIcon } from '@/components/release-widgets';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
interface DashboardData {
  oss: {
    releases: Release[];
    hashreleases: Hashrelease[];
  };
  enterprise: {
    releases: Release[];
    hashreleases: Hashrelease[];
  };
}
const ProjectSectionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
      </div>
    </div>
  </div>
);
const ProjectSection = ({ projectId, name, data }: { projectId: ProjectId; name: string; data: DashboardData[ProjectId] }) => (
  <div className="space-y-8">
    <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
      <ProjectIcon projectId={projectId} className="h-8 w-8" />
      {name}
    </h2>
    <div>
      <h3 className="text-xl font-semibold mb-4">Latest Releases</h3>
      {data.releases.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {data.releases.map(release => <ReleaseCard key={release.id} release={release} />)}
        </div>
      ) : <p className="text-muted-foreground">No releases found.</p>}
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-4">Recent Hashreleases</h3>
      {data.hashreleases.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {data.hashreleases.map(hr => <HashreleaseCard key={hr.id} hashrelease={hr} />)}
        </div>
      ) : <p className="text-muted-foreground">No hashreleases found.</p>}
    </div>
  </div>
);
export function HomePage() {
  const { isDark, toggleTheme } = useTheme();
  useEffect(() => {
    if (!isDark) {
      toggleTheme(); // Force dark mode
    }
  }, [isDark, toggleTheme]);
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: () => api('/api/dashboard'),
  });
  return (
    <AppLayout>
      <div className="relative min-h-screen bg-background">
        <ThemeToggle className="absolute top-6 right-6" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold tracking-tighter text-foreground">Mission Control</h1>
            <p className="text-lg text-muted-foreground mt-2">A high-level overview of all release activities.</p>
          </header>
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <ProjectSectionSkeleton />
              <ProjectSectionSkeleton />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load dashboard data. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <ProjectSection projectId="oss" name="Open Source" data={data.oss} />
              <ProjectSection projectId="enterprise" name="Enterprise" data={data.enterprise} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}