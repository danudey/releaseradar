import { CheckCircle2, XCircle, AlertCircle, GitCommitHorizontal, GitBranch, Clock, User, Tag, Package, Building, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Hashrelease, ProjectId, Release, StepStatus } from '@shared/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
// Status Badge Component
export const StatusBadge = ({ success, label, failLabel }: { success: boolean; label: string; failLabel: string }) => (
  <Badge variant={success ? 'default' : 'destructive'} className={cn('flex items-center gap-1.5 transition-all', success ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30')}>
    {success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    <span>{success ? label : failLabel}</span>
  </Badge>
);
// Ready for Release Badge
export const ReadyForReleaseBadge = ({ isReady }: { isReady: boolean }) => (
  <Badge variant={isReady ? 'default' : 'secondary'} className={cn('flex items-center gap-1.5 transition-all', isReady ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
    {isReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
    <span>{isReady ? 'Ready for release' : 'Not ready'}</span>
  </Badge>
);
// Hashrelease Card Component
export const HashreleaseCard = ({ hashrelease }: { hashrelease: Hashrelease }) => (
  <Card className="hover:border-primary/50 transition-colors duration-200 bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="font-mono text-lg text-primary">{hashrelease.version}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4" />
            <span className="font-mono">{hashrelease.id}</span>
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ReadyForReleaseBadge isReady={hashrelease.isReadyForRelease} />
            </TooltipTrigger>
            <TooltipContent>
              <p>This hashrelease is {hashrelease.isReadyForRelease ? '' : 'not'} ready to be promoted.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge success={hashrelease.buildSuccess} label="Build OK" failLabel="Build Failed" />
        <StatusBadge success={hashrelease.testSuccess} label="Tests OK" failLabel="Tests Failed" />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span>Branch: <span className="font-medium text-foreground">{hashrelease.branch}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Created {formatDistanceToNow(new Date(hashrelease.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);
// Release Card Component
export const ReleaseCard = ({ release }: { release: Release }) => (
  <Link to={`/release/${release.id}`}>
    <Card className="hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Tag className="h-5 w-5" />
            {release.version}
          </CardTitle>
          <Badge variant={release.completedAt ? 'secondary' : 'default'} className={cn(release.completedAt ? '' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 animate-pulse')}>
            {release.completedAt ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <GitBranch className="h-4 w-4" />
          <span>{release.branch}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>By: <span className="font-medium text-foreground">{release.releaseManager}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Started {format(new Date(release.startedAt), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="h-4 w-4" />
          <span className="font-mono">{release.hashreleaseId}</span>
        </div>
      </CardContent>
    </Card>
  </Link>
);
export const ProjectIcon = ({ projectId, className }: { projectId: ProjectId; className?: string }) => {
  if (projectId === 'oss') return <Box className={cn("h-5 w-5", className)} />;
  return <Building className={cn("h-5 w-5", className)} />;
};
// Step Indicator for Release Page
export const StepIndicator = ({ status, isFirst, isLast }: { status: StepStatus; isFirst?: boolean; isLast?: boolean }) => {
  const statusClasses = {
    pending: 'bg-gray-600 border-gray-500',
    'in-progress': 'bg-blue-500 border-blue-400 animate-pulse',
    done: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
  };
  return (
    <div className="relative flex items-center">
      {!isFirst && <div className="absolute bottom-full left-1/2 -translate-x-1/2 h-6 w-0.5 bg-border" />}
      <div className={cn('h-3 w-3 rounded-full border-2', statusClasses[status])} />
      {!isLast && <div className="absolute top-full left-1/2 -translate-x-1/2 h-6 w-0.5 bg-border" />}
    </div>
  );
};