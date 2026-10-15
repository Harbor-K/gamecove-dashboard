import React, { useState } from "react";
import { DoorOpen, Flag, TriangleAlert } from "lucide-react";
import { fieldLabels, fieldOrder, fieldPlaceholders } from "../../data/mapping";
import type { MappingNode, NodeDetails, NodeMappingStatus, ScriptReview } from "../../types/setup";
import { AutoTextarea } from "../ui/AutoTextarea";
import { Button } from "../ui/Button";
import { DrawerFrame, NodeDrawerHeader } from "../setup/DrawerFrame";
import { FieldBadge } from "./FieldBadge";

export type Resolution = { kind: "candidate"; value: string } | { kind: "custom"; value: string } | { kind: "pending" };

// Figma `Drawer / Review node` (Step 3): script check result per field.
export function ReviewDrawer({
  node,
  details,
  status,
  review,
  onSave,
  onClose,
}: {
  node: MappingNode;
  details: NodeDetails;
  status: NodeMappingStatus;
  review?: ScriptReview;
  onSave: (resolution: Resolution | null) => void;
  onClose: () => void;
}) {
  const Icon = node.icon === "door" ? DoorOpen : Flag;
  const needsReview = status === "requiresReview" && review;
  const [choice, setChoice] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const resolution: Resolution | null = !needsReview
    ? null
    : choice === "pending"
      ? { kind: "pending" }
      : choice === "neither"
        ? custom.trim()
          ? { kind: "custom", value: custom }
          : null
        : choice
          ? { kind: "candidate", value: choice }
          : null;

  const options = review ? [...review.candidates, "neither"] : [];

  return (
    <DrawerFrame
      header={<NodeDrawerHeader icon={<Icon size={16} strokeWidth={1.5} />} title={node.title} onClose={onClose} />}
      footer={
        <Button variant="primary" disabled={Boolean(needsReview) && !resolution} onClick={() => onSave(resolution)}>
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        {fieldOrder.map((key) => {
          const field = details[key];
          const flagged = needsReview && review?.field === key;
          const pending = status === "pending" && review?.field === key;
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-label-default text-text-secondary">{fieldLabels[key]}</span>
                {flagged ? (
                  <span className="flex h-6 items-center gap-1 rounded-full bg-bg-critical-subtle px-2 text-caption-default text-text-critical ring-1 ring-inset ring-border-critical-subtle">
                    <TriangleAlert size={12} strokeWidth={1.8} />
                    Requires review
                  </span>
                ) : (
                  <FieldBadge identified={field.identified || field.value.trim().length > 0} pending={pending} />
                )}
              </div>
              <p className="rounded-md bg-bg-canvas px-3 py-[11px] text-body-default text-text-primary ring-1 ring-inset ring-border-default">
                {field.value || <span className="text-text-secondary">{fieldPlaceholders[key]}</span>}
              </p>

              {flagged && review && (
                <div className="mt-2 flex flex-col gap-3 rounded-lg bg-bg-critical-subtle p-4 ring-1 ring-inset ring-border-critical-subtle">
                  <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">Which one is the end point?</span>
                  <div className="flex flex-col gap-1" role="radiogroup" aria-label="Which one is the end point?">
                    {options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        role="radio"
                        aria-checked={choice === o}
                        onClick={() => setChoice(o)}
                        className="flex h-10 items-center gap-3 rounded-md px-2 text-left text-body-default text-text-primary cursor-pointer hover:bg-bg-hover"
                      >
                        <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${choice === o ? "ring-icon-primary" : "ring-icon-secondary"}`}>
                          {choice === o && <span className="size-2.5 rounded-full bg-icon-primary" />}
                        </span>
                        {o === "neither" ? "Neither" : o}
                      </button>
                    ))}
                  </div>
                  {choice === "neither" && (
                    <div className="flex flex-col gap-2">
                      <span className="text-label-default text-text-secondary">How does play end here?</span>
                      <div className="rounded-md bg-bg-canvas px-3 py-[11px] ring-1 ring-inset ring-border-default">
                        <AutoTextarea value={custom} onChange={setCustom} placeholder="Describe how play ends here" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-label-default text-text-secondary">Not sure?</span>
                    <button
                      type="button"
                      onClick={() => setChoice("pending")}
                      aria-pressed={choice === "pending"}
                      className={`text-label-default underline cursor-pointer ${choice === "pending" ? "text-status-pending" : "text-text-primary hover:text-text-accent"}`}
                    >
                      Leave this pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DrawerFrame>
  );
}
