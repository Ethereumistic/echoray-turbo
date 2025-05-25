import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import Link from 'next/link';

export default async function VideosPlaygroundPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's survey responses filtered by video
  const surveyResponses = await database.surveyResponse.findMany({
    where: {
      userId: userId,
      surveyType: {
        has: 'video'
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (surveyResponses.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Videos Playground</h1>
          <p className="text-muted-foreground mb-6">It looks empty, submit a survey to get started!</p>
          <Button asChild>
            <Link href="https://echoray.io" target="_blank" rel="noopener noreferrer">
              Submit Survey
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Videos Playground</h1>
        <div className="space-y-6">
          {surveyResponses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle>Video Survey Response</CardTitle>
                <CardDescription>
                  Submitted on {response.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {response.projectPurpose && (
                  <div>
                    <h3 className="font-semibold mb-2">Project Purpose</h3>
                    <p className="text-sm text-muted-foreground">{response.projectPurpose}</p>
                  </div>
                )}
                
                {response.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {response.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {response.priorities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Priorities</h3>
                    <div className="flex flex-wrap gap-2">
                      {response.priorities.map((priority, index) => (
                        <Badge key={index} variant="outline">{priority}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {response.businessGoals && (
                  <div>
                    <h3 className="font-semibold mb-2">Business Goals</h3>
                    <p className="text-sm text-muted-foreground">{response.businessGoals}</p>
                  </div>
                )}
                
                {response.competitors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Competitors</h3>
                    <div className="flex flex-wrap gap-2">
                      {response.competitors.map((competitor, index) => (
                        <Badge key={index} variant="destructive">{competitor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {response.timeline && (
                    <div>
                      <h3 className="font-semibold mb-2">Timeline</h3>
                      <p className="text-sm text-muted-foreground">{response.timeline}</p>
                    </div>
                  )}
                  
                  {response.budget && (
                    <div>
                      <h3 className="font-semibold mb-2">Budget</h3>
                      <p className="text-sm text-muted-foreground">{response.budget}</p>
                    </div>
                  )}
                </div>
                
                {response.additionalInfo && (
                  <div>
                    <h3 className="font-semibold mb-2">Additional Information</h3>
                    <p className="text-sm text-muted-foreground">{response.additionalInfo}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Survey Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {response.surveyType.map((type, index) => (
                      <Badge key={index} variant="default">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 