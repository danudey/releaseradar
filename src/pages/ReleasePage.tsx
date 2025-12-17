import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Release, StepStatus } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Check, Clock, GitBranch, GitCommitHorizontal, Loader2, Tag, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toaster, toast } from 'sonner';
const stepStatuses: StepStatus[] = ['pending', 'in-progress', 'done', 'error'];
const getNextStatus = (current: StepStatus): StepStatus => {
  const currentIndex = stepStatuses.indexOf(current);
  return stepStatuses[(currentIndex + 1) % stepStatuses.length];
};
const StatusIcon = ({ status }: { status: StepStatus }) => {
  switch (status) {
    case 'done': return <Check className="h-5 w-5 text-green-500" />;
    case 'in-progress': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case 'error': return <X className="h-5 w-5 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};
export function ReleasePage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const queryClient = useQueryClient();
  const { data: release, isLoading, error } = useQuery<Release>({
    queryKey: ['release', releaseId],
    queryFn: () => api(`/api/releases/${releaseId}`),
    enabled: !!releaseId,
  });
  const mutation = useMutation({
    mutationFn: ({ stepName, status }: { stepName: string; status: StepStatus }) =>
      api<Release>(`/api/releases/${releaseId}/step`, {
        method: 'PATCH',
        body: JSON.stringify({ stepName, status }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['release', releaseId], data);
      toast.success(`Step updated successfully!`);
    },
    onError: () => {
      toast.error('Failed to update step.');
    },
  });
  const handleStepToggle = (stepName: string, currentStatus: StepStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    mutation.mutate({ stepName, status: nextStatus });
  };
  if (isLoading) return <AppLayout><div className="p-8"><Skeleton className="h-96 w-full" /></div></AppLayout>;
  if (error) return <AppLayout><div className="p-8"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load release.</AlertDescription></Alert></div></AppLayout>;
  if (!release) return <AppLayout><div className="p-8"><p>Release not found.</p></div></AppLayout>;
  return (
    <AppLayout>
      <Toaster richColors />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" className="mb-4">
          <Link to={`/project/${release.projectId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Project</Link>
        </Button>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-3 text-3xl font-bold">
              <Tag className="h-8 w-8" />
              {release.version}
            </CardTitle>
            <CardDescription>Release Command Center</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold">Release Lifecycle</h3>
              <div className="relative flex flex-col gap-4 pl-8 border-l-2 border-dashed">
                {release.lifecycle.map((step, index) => (
                  <div key={index} className="relative flex items-center">
                    <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 p-1 bg-background rounded-full">
                      <StatusIcon status={step.status} />
                    </div>
                    <div className="flex-grow">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => handleStepToggle(step.name, step.status)}
                              disabled={mutation.isPending}
                            >
                              <div>
                                <p className={cn("font-semibold", step.status === 'done' && 'text-green-500', step.status === 'in-progress' && 'text-blue-500', step.status === 'error' && 'text-red-500')}>{step.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                  {step.completedAt && ` - ${formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}`}
                                </p>
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to cycle status: Pending → In Progress → Done → Error</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Details</h3>
              <div className="flex items-center gap-3 text-muted-foreground">
                <GitBranch className="h-4 w-4 flex-shrink-0" />
                <span>Branch: <span className="font-medium text-foreground">{release.branch}</span></span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <GitCommitHorizontal className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-foreground">{release.hashreleaseId}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>Manager: <span className="font-medium text-foreground">{release.releaseManager}</span></span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Started: <span className="font-medium text-foreground">{format(new Date(release.startedAt), 'PPpp')}</span></span>
              </div>
              {release.completedAt && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>Completed: <span className="font-medium text-foreground">{format(new Date(release.completedAt), 'PPpp')}</span></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}