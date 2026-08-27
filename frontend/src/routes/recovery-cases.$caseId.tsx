import { createFileRoute } from "@tanstack/react-router";
import { CaseReplayPage } from "../components/pages";

export const Route = createFileRoute("/recovery-cases/$caseId")({
  component: CaseReplayPage,
});