import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Target, Zap, Users, Clock, DollarSign, MessageSquare, Globe } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WebsitesPlaygroundPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Await search params since they're now a Promise in Next.js 15
  const resolvedSearchParams = await searchParams;

  // Get page from search params
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 1; // Show one survey per page

  // Fetch user's survey responses filtered by websites
  const surveyResponses = await database.surveyResponse.findMany({
    where: {
      userId: userId,
      surveyType: {
        has: 'websites'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  // Get total count for pagination
  const totalCount = await database.surveyResponse.count({
    where: {
      userId: userId,
      surveyType: {
        has: 'websites'
      }
    }
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (surveyResponses.length === 0 && page === 1) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/playground">Playground</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Websites</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">No Websites Found</h1>
              <p className="text-muted-foreground">Submit a survey to see your project details here</p>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="https://echoray.io" target="_blank" rel="noopener noreferrer">
                Submit Survey
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (surveyResponses.length === 0) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/playground">Playground</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Websites</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">No Survey Found</h1>
            <p className="text-muted-foreground">This page doesn't exist.</p>
            <Button asChild variant="outline">
              <Link href="/playground/websites">Back to Page 1</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const response = surveyResponses[0];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/playground">Playground</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Websites</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Header Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 px-4 ml-auto">
            <span className="text-sm text-muted-foreground">
              {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              asChild={hasPrevPage}
              disabled={!hasPrevPage}
            >
              {hasPrevPage ? (
                <Link href={`/playground/websites?page=${page - 1}`}>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild={hasNextPage}
              disabled={!hasNextPage}
            >
              {hasNextPage ? (
                <Link href={`/playground/websites?page=${page + 1}`}>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </header>

      <div className="flex-1 p-4 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Survey Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold">Website Project</h1>
            <p className="text-sm text-muted-foreground">
              {response.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {response.surveyType.map((type, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Compact Bento Grid - Fits in viewport */}
        <div className="grid grid-cols-6 grid-rows-4 gap-3 h-full">
          {/* Row 1: Project Basics */}
          <Card className="col-span-2 row-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-bold capitalize">
                {response.surveyType || "Not specified"}
              </div>
              {response.designStyle && (
                <div className="text-xs text-muted-foreground">{response.designStyle}</div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-2 row-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline & Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm font-semibold">{response.timeline || "Not specified"}</div>
              <div className="text-sm text-muted-foreground">{response.budget || "Not specified"}</div>
            </CardContent>
          </Card>

          <Card className="col-span-2 row-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Top Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm font-semibold">
                {response.priorities.length > 0 ? response.priorities[0] : "Not specified"}
              </div>
              <div className="text-xs text-muted-foreground">Primary focus</div>
            </CardContent>
          </Card>

          {/* Row 2: Features & Platforms */}
          <Card className="col-span-3 row-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Required Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {response.features.slice(0, 4).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                    {feature.length > 15 ? feature.substring(0, 15) + "..." : feature}
                  </Badge>
                ))}
                {response.features.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{response.features.length - 4}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 row-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Platforms & Competitors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {response.platforms && response.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {response.platforms.slice(0, 3).map((platform: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                )}
                {response.competitors.slice(0, 2).map((competitor, index) => (
                  <div key={index} className="text-xs bg-muted px-2 py-1 rounded truncate">
                    {competitor}
                  </div>
                ))}
                {response.competitors.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{response.competitors.length - 2} more competitors
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Row 3-4: Business Goal & Project Purpose */}
          <Card className="col-span-3 row-span-2 mb-14">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Business Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed line-clamp-6">
                {response.businessGoals || "No business goals specified"}
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-3 row-span-2 mb-14">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Project Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed line-clamp-6">
                {response.projectPurpose || response.additionalInfo || "No additional information provided"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 