import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const skillEntries = [
  {
    description:
      "Operate Host Hermes Agent through the public website and avoid direct private API usage.",
    name: "use-host-hermes-webapp",
    type: "skill-md",
    url: "/.well-known/agent-skills/use-host-hermes-webapp/SKILL.md",
  },
  {
    description:
      "Guide an agent through the browser-based free trial and Stripe checkout flow.",
    name: "start-free-trial",
    type: "skill-md",
    url: "/.well-known/agent-skills/start-free-trial/SKILL.md",
  },
  {
    description:
      "Find the machine-readable discovery documents published by Host Hermes Agent.",
    name: "host-hermes-discovery",
    type: "skill-md",
    url: "/.well-known/agent-skills/host-hermes-discovery/SKILL.md",
  },
] as const;

async function buildSkillIndex() {
  const skills = await Promise.all(
    skillEntries.map(async (skill) => {
      const filePath = path.join(
        process.cwd(),
        "public",
        skill.url.replace(/^\//, ""),
      );
      const bytes = await readFile(filePath);
      const digest = createHash("sha256").update(bytes).digest("hex");

      return {
        ...skill,
        digest: `sha256:${digest}`,
      };
    }),
  );

  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills,
  };
}

export async function GET() {
  return NextResponse.json(await buildSkillIndex());
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
