import {
  createMarkdownHeadResponse,
  createMarkdownResponse,
  getApiDocsMarkdown,
} from "@/lib/agent-markdown";

export function GET() {
  return createMarkdownResponse(getApiDocsMarkdown());
}

export function HEAD() {
  return createMarkdownHeadResponse(getApiDocsMarkdown());
}
