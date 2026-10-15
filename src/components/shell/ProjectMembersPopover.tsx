import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projectMembers } from "../../data/workspace";
import { LOCALE } from "../../i18n/locale";

// Copy (repo t.projectMembers / t.role). Set here so names and roles never go through the page translator.
const T =
  LOCALE === "ko"
    ? { title: "접근 권한이 있는 멤버", copyLink: "링크 복사", close: "닫기", invitePlaceholder: "초대할 이메일을 쉼표로 구분해 입력", invite: "초대", you: "(나)", changeRole: (n: string) => `${n}의 역할 변경`, role: { owner: "소유자", editor: "편집자", viewer: "뷰어" } }
    : { title: "Who has access", copyLink: "Copy link", close: "Close", invitePlaceholder: "Add comma separated emails to invite", invite: "Invite", you: "(you)", changeRole: (n: string) => `Change role for ${n}`, role: { owner: "Owner", editor: "Editor", viewer: "Viewer" } };

/** Screen px → CSS px (the whole app is scaled by --gc-zoom). */
const toCssPx = (px: number) => px / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1);

/** Icon / link 12 (stroke 2) — repo components/icons-dashboard.tsx LinkIcon */
function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-icon-ai">
      <path d="M9.02929 6.97064C8.48304 6.42512 7.74261 6.11871 6.97062 6.11871C6.19863 6.11871 5.4582 6.42512 4.91195 6.97064L2.85262 9.02931C2.30654 9.57539 1.99976 10.316 1.99976 11.0883C1.99976 11.8606 2.30654 12.6012 2.85262 13.1473C3.3987 13.6934 4.13935 14.0002 4.91162 14.0002C5.6839 14.0002 6.42454 13.6934 6.97062 13.1473L7.99995 12.118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.97058 9.02932C7.51683 9.57484 8.25725 9.88124 9.02925 9.88124C9.80124 9.88124 10.5417 9.57484 11.0879 9.02932L13.1472 6.97065C13.6933 6.42457 14.0001 5.68393 14.0001 4.91165C14.0001 4.13938 13.6933 3.39873 13.1472 2.85265C12.6012 2.30657 11.8605 1.99979 11.0882 1.99979C10.316 1.99979 9.57533 2.30657 9.02925 2.85265L7.99991 3.88199" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon / close 20 (stroke 2) — repo components/icons-mapping.tsx CloseIcon */
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M15 15L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon / chevron-down 12 (stroke 2) — repo ChevronDownXsIcon */
function ChevronDownXsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-icon-secondary">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Figma `Popover / Project members` (repo components/shell/project-members-popover.tsx): w420 p24 radius 16, shadow 0 12 32.
 * Opens 16px right of the nav, top-aligned with the Project members item. Copy link · Invite · role change are hover only.
 * Closes on X, Escape or a click outside (not on the anchor, which toggles it).
 */
export function ProjectMembersPopover({ anchor, onClose }: { anchor: HTMLElement; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  const r = anchor.getBoundingClientRect();
  const navRight = anchor.closest("nav")?.getBoundingClientRect().right ?? r.right;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      data-no-translate
      aria-label={T.title}
      className="fixed z-50 flex w-[420px] flex-col rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default shadow-[0_12px_32px_0_var(--gc-effect-shadow)]"
      style={{ top: toCssPx(r.top), left: toCssPx(navRight) + 16, animation: "gc-pop-in 200ms cubic-bezier(0.2,0.8,0.2,1) both" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold leading-[1.5] text-text-primary">{T.title}</h2>
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-2 text-label-default text-text-accent cursor-pointer hover:underline">
            <LinkIcon />
            {T.copyLink}
          </button>
          <button type="button" aria-label={T.close} onClick={onClose} className="flex size-5 items-center justify-center text-icon-secondary icon-hit hover:text-icon-primary">
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 py-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={T.invitePlaceholder}
          className="h-control-40 min-w-0 flex-1 rounded-md bg-bg-canvas px-3 text-label-default text-text-primary caret-text-primary outline-none ring-1 ring-inset ring-border-default placeholder:text-text-secondary"
        />
        <button type="button" className="flex h-control-40 items-center justify-center rounded-md bg-bg-subtle px-4 text-label-default text-text-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary">
          {T.invite}
        </button>
      </div>
      <div className="h-px w-full bg-border-default" />
      <div className="flex flex-col gap-1 pt-4">
        {projectMembers.map((m) => (
          <div key={m.id} className="flex h-control-40 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-avatar-violet">
                <img src={m.avatar} alt="" className="size-full object-cover" />
              </span>
              <span className="flex items-center gap-2">
                <span className="text-fs-16 leading-[1.6] text-text-primary">{m.name}</span>
                {m.isYou && <span className="text-label-default text-text-secondary">{T.you}</span>}
              </span>
            </div>
            {m.role === "owner" ? (
              <span className="text-fs-16 leading-[1.6] text-text-secondary">{T.role[m.role]}</span>
            ) : (
              <button type="button" aria-label={T.changeRole(m.name)} className="flex items-center gap-2 text-fs-16 leading-[1.6] text-text-primary cursor-pointer">
                {T.role[m.role]}
                <ChevronDownXsIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
