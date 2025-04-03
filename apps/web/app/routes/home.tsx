import type { Route } from './+types/home';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { type Problem, getProblem } from 'online-judge-scraper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import {
  BookOpen,
  Clock,
  HardDrive,
  Hash,
  Copy,
  Loader2,
  FileJson,
  Code,
  FileText,
  List,
  RotateCcw,
  Search,
} from 'lucide-react';
import { data, useActionData, useFetcher } from 'react-router';
import { useState } from 'react';

const PROBLEMS = [
  {
    id: '1A',
    name: 'Theatre Square',
    url: 'https://codeforces.com/problemset/problem/1/A',
    judge: 'codeforces',
  },
  {
    id: '4A',
    name: 'Watermelon',
    url: 'https://codeforces.com/problemset/problem/4/A',
    judge: 'codeforces',
  },
  {
    id: '71A',
    name: 'Way Too Long Words',
    url: 'https://codeforces.com/problemset/problem/71/A',
    judge: 'codeforces',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Online Judge Scraper Playground' },
    {
      name: 'description',
      content: 'Parse competitive programming problems from various platforms',
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const problemUrl = formData.get('problemUrl') as string;

  if (!problemUrl) {
    return data({ error: 'Problem URL is required' }, { status: 400 });
  }

  const problem = await getProblem(problemUrl);

  return { problem };
}

export default function Home() {
  const fetcher = useFetcher<{ problem?: Problem }>();
  const loading = fetcher.state !== 'idle';
  const hasProblem = !!fetcher.data?.problem;
  const [selectedJudge, setSelectedJudge] = useState('all');

  const handlePresetClick = (url: string) => {
    const form = document.querySelector('form') as HTMLFormElement;
    const input = form?.querySelector(
      'input[name="problemUrl"]',
    ) as HTMLInputElement;
    if (input) {
      input.value = url;
      form.requestSubmit();
    }
  };

  const handleReset = () => {
    const form = document.querySelector('form') as HTMLFormElement;
    const input = form?.querySelector(
      'input[name="problemUrl"]',
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
      form.requestSubmit();
    }
    fetcher.data = undefined;
  };

  const filteredProblems =
    selectedJudge === 'all'
      ? PROBLEMS
      : PROBLEMS.filter((problem) => problem.judge === selectedJudge);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Online Judge Scraper Playground
          </h1>
          <p className="text-muted-foreground">
            Choose a preset problem or paste a URL to get started
          </p>
        </div>

        <fetcher.Form method="post" className="flex gap-2 max-w-2xl mx-auto">
          <Input
            type="url"
            name="problemUrl"
            placeholder="Enter problem URL..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Loading...' : 'Get Problem'}
          </Button>
          {hasProblem && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </fetcher.Form>

        {!hasProblem && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Select
                defaultValue="all"
                onValueChange={(value) => setSelectedJudge(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="codeforces">Codeforces</SelectItem>
                  <SelectItem value="leetcode">LeetCode</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch id="raw-data" />
                <Label htmlFor="raw-data">Show Raw Data</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handlePresetClick(problem.url)}
                  >
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">
                        {problem.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>Codeforces {problem.id}</span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="bg-muted/50 rounded-md border col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No problems found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    There are no preset problems available for the platform. Try
                    selecting a different platform or paste a problem URL above.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {hasProblem && fetcher.data?.problem && (
          <ProblemCard problem={fetcher.data.problem} />
        )}
      </div>
    </div>
  );
}

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5" />
          {problem.name}
        </CardTitle>

        <div className="flex flex-wrap gap-2">
          {problem.timeLimit && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {problem.timeLimit}
            </Badge>
          )}
          {problem.memoryLimit && (
            <Badge variant="outline" className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {problem.memoryLimit}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {problem.difficulty && (
            <Badge variant="secondary" className="capitalize">
              {problem.difficulty}
            </Badge>
          )}
          {problem.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Hash className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Raw Data
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="space-y-6">
              {problem.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Description
                  </div>
                  <div className="rounded-md bg-muted p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert -my-4">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: problem.description,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {problem.plainTextDescription && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Plain Text Description
                  </div>
                  <div className="rounded-md border p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {problem.plainTextDescription}
                    </pre>
                  </div>
                </div>
              )}

              {problem.sampleTestCases &&
                problem.sampleTestCases.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Code className="w-4 h-4" />
                      Sample Test Cases
                    </div>
                    <div className="space-y-4">
                      {problem.sampleTestCases.map((testCase, index) => (
                        <Card key={index} className="gap-3">
                          <CardHeader className="py-0">
                            <CardTitle className="text-sm">
                              Sample {index + 1}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Input</div>
                              <div className="rounded-md bg-muted p-3">
                                <pre className="whitespace-pre-wrap text-sm">
                                  {testCase.input}
                                </pre>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Output</div>
                              <div className="rounded-md bg-muted p-3">
                                <pre className="whitespace-pre-wrap text-sm">
                                  {testCase.output}
                                </pre>
                              </div>
                            </div>
                            {testCase.explanation && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Explanation
                                </div>
                                <div className="rounded-md bg-muted p-3">
                                  <p className="text-sm">
                                    {testCase.explanation}
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </TabsContent>
          <TabsContent value="raw">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Raw JSON Data
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(problem, null, 2),
                    )
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {JSON.stringify(problem, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
