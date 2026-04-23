import {
  createMarkdownHeadResponse,
  createMarkdownResponse,
  getHomePageMarkdown,
} from "@/lib/agent-markdown";

export function GET() {
  return createMarkdownResponse(getHomePageMarkdown());
}

export function HEAD() {
  return createMarkdownHeadResponse(getHomePageMarkdown());
}
