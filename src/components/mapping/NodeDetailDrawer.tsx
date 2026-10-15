import React from "react";
import { Check, DoorOpen, Flag } from "lucide-react";
import { fieldLabels, fieldOrder, fieldPlaceholders } from "../../data/mapping";
import type { MappingNode, NodeDetails } from "../../types/setup";
import { AutoTextarea } from "../ui/AutoTextarea";
import { Button } from "../ui/Button";
import { DrawerFrame, NodeDrawerHeader } from "../setup/DrawerFrame";
import { FieldBadge } from "./FieldBadge";

// Figma `Drawer / Node detail` (Step 2): AI-read fields + "Apply this to other nodes?"
// Confirming here IS the developer approval for this node (and any nodes it is applied to).
export function NodeDetailDrawer({
  node,
  draft,
  onChange,
  otherNodes,
  checkedIds,
  onToggleOther,
  onReset,
  onSave,
  onClose,
}: {
  node: MappingNode;
  draft: NodeDetails;
  onChange: (d: NodeDetails) => void;
  otherNodes: MappingNode[];
  checkedIds: string[];
  onToggleOther: (id: string) => void;
  onReset: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const Icon = node.icon === "door" ? DoorOpen : Flag;
  const extra = checkedIds.length;
  return (
    <DrawerFrame
      header={<NodeDrawerHeader icon={<Icon size={16} strokeWidth={1.5} />} title={node.title} onClose={onClose} />}
      footer={
        <>
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
          <Button variant="primary" icon={<Check size={16} strokeWidth={2} />} onClick={onSave}>
            {extra > 0 ? `Confirm ${extra + 1} nodes` : "Confirm"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        {fieldOrder.map((key) => {
          const field = draft[key];
          const missing = !field.identified && field.value.trim().length === 0;
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-label-default text-text-secondary">{fieldLabels[key]}</span>
                <FieldBadge identified={field.identified || field.value.trim().length > 0} />
              </div>
              <div
                className={`rounded-md bg-bg-canvas px-3 py-[11px] ring-1 ring-inset ${missing ? "ring-status-critical" : "ring-border-default"}`}
              >
                <AutoTextarea
                  value={field.value}
                  ariaLabel={fieldLabels[key]}
                  placeholder={fieldPlaceholders[key]}
                  onChange={(value) => onChange({ ...draft, [key]: { ...field, value } })}
                />
              </div>
            </div>
          );
        })}

        <div className="h-px w-full bg-border-default" />

        <div className="flex flex-col gap-3">
          <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">Apply this to other nodes?</span>
          <div className="flex flex-col gap-1">
            {otherNodes.map((n) => {
              const on = checkedIds.includes(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggleOther(n.id)}
                  className="flex h-10 items-center gap-3 rounded-md px-2 text-left text-body-default text-text-primary cursor-pointer hover:bg-bg-hover"
                >
                  <span
                    className={`flex size-[18px] shrink-0 items-center justify-center rounded-sm ${
                      on ? "bg-icon-primary text-icon-inverse" : "ring-1 ring-inset ring-icon-secondary"
                    }`}
                  >
                    {on && <Check size={12} strokeWidth={2.5} />}
                  </span>
                  {n.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DrawerFrame>
  );
}
