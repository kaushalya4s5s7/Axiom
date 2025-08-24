"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, Save } from "lucide-react";
import useAuditStore from "@/store/auditStore";

const SeverityBadge = ({ severity }: { severity: string }) => {
  const validSeverity = severity || "unknown";
  const getBadgeStyles = () => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const getIcon = () => {
    switch (validSeverity) {
      case "critical":
      case "high":
        return <AlertTriangle className="w-3 h-3" />;
      case "medium":
        return <AlertCircle className="w-3 h-3" />;
      case "low":
        return <Info className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  return (
    <div
      className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1 ${getBadgeStyles()}`}
    >
      {getIcon()}
      <span>
        {validSeverity.charAt(0).toUpperCase() + validSeverity.slice(1)}
      </span>
    </div>
  );
};

interface AuditIssue {
  id: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  line?: number | null;
  recommendation?: string;
}

const AuditResults = () => {
  const [selectedIssue, setSelectedIssue] = useState<AuditIssue | null>(null);
  const { issues, auditScore, auditReport, contractHash, issueCount } = useAuditStore();

  // Generate audit report for download
  const generateAuditFile = () => {
    const auditData = {
      auditScore,
      contractHash,
      issueCount,
      issues,
      auditReport,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
        auditTool: "Smart Contract Auditor"
      }
    };

    const fileContent = JSON.stringify(auditData, null, 2);
    const fileName = `audit-report-${contractHash || 'unknown'}-${Date.now()}.json`;
    const blob = new Blob([fileContent], { type: "application/json" });
    
    return new File([blob], fileName, { type: "application/json" });
  };

  const handleDownload = () => {
    const file = generateAuditFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Audit Summary */}
      <div className="lg:col-span-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Audit Summary</h3>
        <p className="text-sm text-gray-300">
          Overall Security Score:{" "}
          <span
            className={`font-bold ${
              auditScore >= 80
                ? "text-green-400"
                : auditScore >= 60
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {auditScore}%
          </span>
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(issueCount).map(([severity, count]) => (
            <div
              key={severity}
              className="flex flex-col items-center bg-black/20 p-4 rounded-lg"
            >
              <SeverityBadge severity={severity} />
              <span className="text-white font-medium mt-2">{count}</span>
              <span className="text-gray-400 text-xs capitalize">
                {severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Issues */}
      <div className="lg:col-span-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Detailed Issues ({issues.length} found)
        </h3>

        {/* Debug info (remove in production) */}
        {issues.length === 0 && auditReport && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              No issues parsed from audit report. Check console for debug info.
            </p>
            <details className="mt-2">
              <summary className="text-yellow-300 text-xs cursor-pointer">Show raw audit report preview</summary>
              <pre className="text-xs text-gray-300 mt-2 whitespace-pre-wrap max-h-32 overflow-auto bg-black/20 p-2 rounded">
                {auditReport.substring(0, 1000)}...
              </pre>
            </details>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Issue List */}
          <div className="md:col-span-1 bg-black/20 rounded-lg p-4 overflow-auto max-h-[500px]">
            {issues.length > 0 ? (
              issues.map((issue: AuditIssue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer border ${
                    selectedIssue?.id === issue.id
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-white font-medium truncate pr-2">
                      {issue.title || "Untitled Issue"}
                    </div>
                    <SeverityBadge severity={issue.severity || "unknown"} />
                  </div>
                  <div className="text-xs text-gray-400">
                    {issue.source || "Unknown source"} {issue.line ? `• Line ${issue.line}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center space-y-2">
                <div>No detailed issues were parsed from the audit report.</div>
                {auditReport ? (
                  <div className="text-xs">
                    The audit report exists but may not be in the expected format.
                  </div>
                ) : (
                  <div className="text-xs">
                    No audit report available. Please run an audit first.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Issue Details */}
          <div className="md:col-span-2 bg-black/20 rounded-lg p-4">
            {selectedIssue ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-medium">
                    {selectedIssue.title || "Untitled Issue"}
                  </h4>
                  <SeverityBadge severity={selectedIssue.severity || "unknown"} />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Source</div>
                  <div className="text-sm text-white">
                    {selectedIssue.source || "Unknown source"}
                  </div>
                </div>

                {selectedIssue.line && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Location</div>
                    <div className="text-sm text-white">
                      Line {selectedIssue.line}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Description</div>
                  <div className="text-sm text-white whitespace-pre-wrap">
                    {selectedIssue.description || "No description available"}
                  </div>
                </div>

                {selectedIssue.recommendation && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">
                      Recommendation
                    </div>
                    <div className="text-sm text-white">
                      {selectedIssue.recommendation}
                    </div>
                  </div>
                )}
              </div>
            ) : issues.length > 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select an issue to view details
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <div>No issues to display</div>
                <div className="text-xs text-center">
                  {auditReport ? 
                    "The audit completed but no structured issues were found. Check the raw audit report above." :
                    "Run an audit to see detailed security issues here."
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="lg:col-span-4 mt-4">
        <button
          onClick={handleDownload}
          className="px-6 py-2 rounded-lg text-center border-2 border-white/20 text-white/80 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Download Audit Report</span>
        </button>
      </div>
    </div>
  );
};

export default AuditResults;