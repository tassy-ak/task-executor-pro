import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ThreatAnalysisProps {
  analysis: string | null;
  isAnalyzing?: boolean;
}

const ThreatAnalysis = ({ analysis, isAnalyzing }: ThreatAnalysisProps) => {
  if (isAnalyzing) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Threat Analysis</h3>
          <Badge variant="secondary" className="ml-auto">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Analyzing...
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>AI is analyzing the threat pattern...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Threat Analysis</h3>
        <Badge variant="default" className="ml-auto">
          Analyzed
        </Badge>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h4 className="text-base font-semibold mt-4 mb-2">{children}</h4>,
            h2: ({ children }) => <h5 className="text-sm font-semibold mt-3 mb-1">{children}</h5>,
            h3: ({ children }) => <h6 className="text-sm font-medium mt-2 mb-1">{children}</h6>,
            p: ({ children }) => <p className="text-sm text-muted-foreground mb-2">{children}</p>,
            ul: ({ children }) => <ul className="text-sm text-muted-foreground list-disc pl-4 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="text-sm text-muted-foreground list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
          }}
        >
          {analysis}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default ThreatAnalysis;