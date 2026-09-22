import { useEffect, useMemo, useState } from "react";

const stages = [
  { name: "Lobby", total: 1000, continued: 600, drop: 400, loss: "40.0%" },
  { name: "Stage 1", total: 600, continued: 500, drop: 100, loss: "16.7%" },
  { name: "Stage 2", total: 540, continued: 372, drop: 168, loss: "31.5%" },
  { name: "Stage 3", total: 350, continued: 170, drop: 180, loss: "51.4%" },
  { name: "Stage 4", total: 190, continued: 50, drop: 140, loss: "73.7%" },
];
const funnel = [["Game first launch",472,100],["Start button seen",446,94.5],["Start button tapped",418,88.6],["Stage 1 entered",287,60.8],["Stage 1 cleared",221,46.8]];
const nav = ["Overview","Engagement","Retention","Experience","Live Ops","Feedback","Explore"];

function Chip({ children, onRemove }) { return <span className="chip">{children}<button aria-label={`${children} remove`} onClick={onRemove}>×</button></span>; }

const projects = [
  ["Bounce Bounce","roblox.com/games/1849… · connected 12 Aug","Roblox","6 members","Tracking · 24 events","2 hours ago","Admin","violet"],
  ["Tower Escape","unity.com/projects/te… · connected 3 Sep","Unity","4 members","Tracking · 11 events","Yesterday","Editor","rose"],
  ["Lantern Harbor","roblox.com/games/2210… · connected 16 Sep","Roblox","2 members","Setup incomplete","3 days ago","Viewer","slate"],
];
const members = [
  ["H","Hyewon Choi","hyewon@hnj.studio","Admin","All 3 projects","Active now"],
  ["J","Jihyun Kim","jihyun@hnj.studio","Admin","All 3 projects","12 minutes ago"],
  ["M","Minseo Park","minseo@hnj.studio","Editor","Bounce Bounce, Tower Escape","2 hours ago"],
  ["D","Daniel Oh","daniel@hnj.studio","Editor","Bounce Bounce","Yesterday"],
  ["S","Sora Lim","sora@hnj.studio","Viewer","Bounce Bounce","3 days ago"],
  ["M","Marcus Webb","marcus@partner.gg","Viewer","Lantern Harbor","2 weeks ago"],
];
const flowSteps = ["Game connected","Base template","Review & approval","Structure detail","Structure saved","All mapped","Manual override","Mapping published","No tracking yet","Choose analyses","Review data to track","Developer handoff","Final review","Tracked data overview","Event-centric data","Event detail"];

function WorkspacePage({ setActive, flash }) {
  return <><section className="page-heading"><div><h1>Projects</h1><p>3 games connected to H&amp;J Team · 12 members · Owner plan</p></div><button className="edit" onClick={() => flash("New project flow opened")}>✎ &nbsp; New project</button></section><section className="data-card"><div className="data-head projects-grid"><span>Project</span><span>Platform</span><span>Members</span><span>Data</span><span>Last activity</span><span>Your role</span></div>{projects.map(([name,desc,platform,people,data,activity,role,color]) => <button className="data-row projects-grid" key={name} onClick={() => setActive("Mapping")}><span className="entity"><i className={color}></i><b>{name}<small>{desc}</small></b></span><span>{platform}</span><span>{people}</span><span className={data.includes("incomplete") ? "negative" : "positive"}>● &nbsp;{data}</span><span>{activity}</span><span><em className="role-badge">{role}</em></span></button>)}</section><section className="usage-card"><div><h3>Plan &amp; usage</h3><button onClick={() => flash("Plan management opened")}>✦ &nbsp; Manage plan</button></div><div className="usage-grid">{[["Seats used","12 / 20","Editor and Admin seats are billed"],["Events tracked this month","4.2M / 10M","Resets 1 Oct"],["Data retention","12 months","Team plan"],["Connected projects","3 / 10","Team plan"]].map(([label,value,note]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div></section></>;
}

function MembersPage({ flash }) {
  const [roles,setRoles] = useState(Object.fromEntries(members.map((m) => [m[1],m[3]])));
  return <><section className="page-heading"><div><h1>Members &amp; roles</h1><p>12 people in H&amp;J Team · 12 of 20 seats used</p></div><button className="edit" onClick={() => flash("Invitation link copied")}>✎ &nbsp; Invite people</button></section><section className="data-card"><div className="data-head members-grid"><span>Member</span><span>Role</span><span>Project access</span><span>Last active</span><span></span></div>{members.map(([initial,name,email,,access,last]) => <div className="data-row members-grid" key={name}><span className="member"><i>{initial}</i><b>{name}<small>{email}</small></b></span><select value={roles[name]} onChange={(e) => {setRoles({...roles,[name]:e.target.value});flash(`${name}'s role updated`);}}><option>Admin</option><option>Editor</option><option>Viewer</option></select><span>{access}</span><span>{last}</span><button>⋮</button></div>)}</section><section className="data-card compact"><h3>Pending invites <small>2</small></h3>{[["rae@hnj.studio","Editor"],["qa@partner.gg","Viewer"]].map(([mail,role]) => <div className="invite-row" key={mail}><span><b>{mail}</b><small>Invited by Hyewon.C · 2 days ago</small></span><span>{role}</span><button onClick={() => flash("Invite resent")}>Resend</button><button onClick={() => flash("Invite revoked")}>Revoke</button></div>)}</section></>;
}

function FlowPage({ mode, flash }) {
  const first = mode === "Logging" ? 8 : 0;
  const last = mode === "Logging" ? flowSteps.length - 1 : 7;
  const [step,setStep] = useState(first);
  const stage = flowSteps[step];
  return <><section className="page-heading"><div><h1>{mode}</h1><p>{mode === "Mapping" ? "Map your game structure and approve the detected journey." : "Choose analyses and generate a developer-ready tracking plan."}</p></div><span className="step-count">{step-first+1} / {last-first+1}</span></section><section className="flow-layout"><aside className="flow-steps">{flowSteps.slice(first,last+1).map((label,index) => <button key={label} className={step === first+index ? "current" : step > first+index ? "done" : ""} onClick={() => setStep(first+index)}><i>{step > first+index ? "✓" : index+1}</i><span>{label}</span></button>)}</aside><div className="flow-canvas"><div className="environment"><span>Production</span><b>Mapping v2.4</b><em>Autosaved just now</em></div><div className="flow-status"><span>{mode}</span><h2>{stage}</h2><p>{mode === "Mapping" ? "GameCove detected the main progression structure. Review stages, tracked events, and governance rules before publishing." : "Configure the events and properties your developers should implement. Changes are reflected in the generated handoff."}</p></div><div className="structure-map">{["Lobby","Stage 1","Stage 2","Stage 3","Stage 4"].map((label,index) => <button key={label} className={index <= Math.min(step-first,4) ? "mapped" : ""} onClick={() => flash(`${label} selected`)}><i>{index===0?"L":"S"}</i><strong>{label}</strong><small>{mode === "Logging" ? "6 events tracked" : index <= step-first ? "Mapped" : "Pending"}</small></button>)}</div><div className="flow-actions"><button disabled={step===first} onClick={() => setStep(step-1)}>Back</button><button onClick={() => step < last ? setStep(step+1) : flash(`${mode} completed`)}>{step < last ? "Continue" : mode === "Mapping" ? "Publish mapping" : "Finish setup"}</button></div></div></section></>;
}

function SettingsPage({ flash }) {
  const [settings,setSettings] = useState({weekly:true,alerts:true,recording:false});
  return <><section className="page-heading"><div><h1>Workspace settings</h1><p>Manage team preferences, access and data governance.</p></div><button className="edit" onClick={() => flash("Settings saved")}>Save changes</button></section><section className="settings-layout"><nav><button className="active">General</button><button>Notifications</button><button>Security</button><button>Data &amp; privacy</button><button>Billing</button></nav><div className="settings-panel"><h2>General settings</h2><label><span><b>Workspace name</b><small>Shown to every member</small></span><input defaultValue="H&J Team" /></label><label><span><b>Default project</b><small>Opened after sign in</small></span><select defaultValue="Bounce Bounce"><option>Bounce Bounce</option><option>Tower Escape</option></select></label>{[["weekly","Weekly executive summary"],["alerts","Data quality alerts"],["recording","Session recording access"]].map(([key,label]) => <label className="setting-toggle" key={key}><span><b>{label}</b><small>Apply this preference across the workspace</small></span><button className={settings[key] ? "on" : ""} onClick={() => setSettings({...settings,[key]:!settings[key]})}><i></i></button></label>)}</div></section></>;
}

function AnalyticsPlaceholder({ active }) { return <><section className="page-heading"><div><h1>{active}</h1><p>Understand how players move, return and engage with your game.</p></div><button className="edit">✎ &nbsp; Edit</button></section><section className="placeholder-grid">{["Players this period","Sessions","Conversion","Median session"].map((x,i)=><article key={x}><span>{x}</span><strong>{["18.4K","42.8K","64.2%","12m 09s"][i]}</strong><small>▲ {2+i}.1% vs last period</small></article>)}</section><section className="trend-card"><div><h2>{active} trend</h2><span>Last 30 days</span></div><div className="trend-bars">{[34,48,42,58,67,62,79,73,88,82,94,86].map((h,i)=><i key={i} style={{height:`${h}%`}}></i>)}</div></section></> }

export function App() {
  const [active, setActive] = useState("Overview");
  const [filters, setFilters] = useState(["Platform: Mobile","Country: KR, US","Cohort: New players"]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [range, setRange] = useState("Weekly exec review");
  const [theme, setTheme] = useState(() => localStorage.getItem("gamecove-theme") || "dark");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const max = useMemo(() => Math.max(...stages.map((s) => s.total)), []);
  const flash = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.themePreference = theme;
    };
    applyTheme();
    localStorage.setItem("gamecove-theme", theme);
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const chooseTheme = (nextTheme) => {
    setTheme(nextTheme);
    setThemeMenuOpen(false);
    flash(`${nextTheme === "system" ? "System" : nextTheme[0].toUpperCase() + nextTheme.slice(1)} theme applied`);
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><img src={`${import.meta.env.BASE_URL}assets/brand.svg`} alt="GameCove" /></div>
      <button className="sidebar-toggle" aria-label="Toggle sidebar">▥</button>
      <button className="game-select"><span>BB</span> Bounce Bounce <b>⌄</b></button>
      <div className="top-actions"><button className="agent">●&nbsp; AI Agent</button><button>Bell</button><button>Help</button><div className="theme-picker"><button className="theme-trigger" aria-haspopup="menu" aria-expanded={themeMenuOpen} onClick={() => setThemeMenuOpen(!themeMenuOpen)}>{theme === "light" ? "라이트" : theme === "system" ? "시스템 설정" : "다크 모드"}</button>{themeMenuOpen && <div className="theme-menu" role="menu" aria-label="Theme"><strong>화면 모드</strong>{[["light","라이트","밝은 화면으로 표시"],["dark","다크 모드","어두운 화면으로 표시"],["system","시스템 설정","기기 설정에 자동으로 맞춤"]].map(([value,label,description]) => <button key={value} role="menuitemradio" aria-checked={theme === value} className={theme === value ? "selected" : ""} onClick={() => chooseTheme(value)}><span>{label}</span><small>{description}</small><b>{theme === value ? "✓" : ""}</b></button>)}</div>}</div></div>
    </header>
    <div className="subbar"><div>H&amp;J Team <i>/</i> {!["Workspace","Members & roles","Workspace settings"].includes(active) && <>Bounce Bounce <i>/</i></>} <strong>{active}</strong> <span>{active === "Members & roles" ? "Admin" : "Editor"}</span></div><div className="sub-actions"><div className="avatars"><b>HC</b><b>HJ</b><b>MK</b><b>+4</b></div><button onClick={() => setShareOpen(true)}>Share</button><button onClick={() => flash("CSV export prepared")}>Export</button><button>⋮</button></div></div>
    <aside className="sidebar">
      <button className="team"><span></span> H&amp;J Team <b>⌄</b></button>
      <div className="nav-title">Analytics <b>⌄</b></div>
      <nav>{nav.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}><i>{item.slice(0,1)}</i>{item}</button>)}</nav>
      <div className="side-sections"><button>Monetisation <b>›</b></button><button>Quality <b>›</b></button><button className={active === "Mapping" ? "active" : ""} onClick={() => setActive("Mapping")}>Mapping <b>›</b></button><button className={active === "Logging" ? "active" : ""} onClick={() => setActive("Logging")}>Logging <b>›</b></button></div>
      <div className="side-foot"><button className={active === "Workspace" ? "active" : ""} onClick={() => setActive("Workspace")}>⌂ &nbsp; Workspace</button><button className={active === "Members & roles" ? "active" : ""} onClick={() => setActive("Members & roles")}>◎ &nbsp; Members &amp; roles</button><button className={active === "Workspace settings" ? "active" : ""} onClick={() => setActive("Workspace settings")}>⚙ &nbsp; Settings</button><div><span>H</span> Hyewon.C</div></div>
    </aside>
    <main className="dashboard">
      {active === "Overview" ? <>
      <section className="page-heading"><div><h1>Overview</h1><p>See how your whole game is performing at a glance.</p></div><button className="edit">✎ &nbsp; Edit</button></section>
      <section className="filters">
        <select value={range} onChange={(e) => setRange(e.target.value)}><option>Weekly exec review</option><option>Daily health check</option><option>Monthly performance</option></select><small>Unsaved changes</small>
        {filters.map((filter) => <Chip key={filter} onRemove={() => setFilters(filters.filter((f) => f !== filter))}>{filter}</Chip>)}
        <button className="add-filter" onClick={() => !filters.includes("Version: 2.4.1") && setFilters([...filters,"Version: 2.4.1"])}>+ Add filter</button>
        <div className="filter-actions"><button onClick={() => flash("View saved")}>Save</button><button onClick={() => flash("New view created")}>Save as new view</button></div>
      </section>
      <section className="briefing"><div className="spark">✦</div><div><strong>Data briefing worth your attention</strong><p>3 metrics moved outside their usual range this week.</p></div><button onClick={() => flash("Briefing reviewed")}>Review briefing</button><button className="close">×</button></section>
      <section className="metrics">{[["Daily active users","1,284","▲ 8.2%","18th Sep 2026 (Today) · vs last week","up"],["New players","312","▲ 4.1%","18th Sep 2026 (Today) · vs last week","up"],["Average playtime","18m 42s","▼ 1.3%","Per player · vs last week","down"],["D1 retention","42.6%","▲ 2.0%","Day 1 return rate · vs last week","up"]].map(([label,value,change,desc,trend]) => <article key={label}><div><span>{label}</span><b className={trend}>{change}</b></div><h2>{value}</h2><p>{desc}</p></article>)}</section>
      <section className="chart-card">
        <div className="legend"><span><i className="blue"></i>Visited, then ended session elsewhere</span><span><i className="pink"></i>Ended session at this stage</span></div><p className="chart-caption">Visited sessions · total bar height</p>
        <div className="chart-area"><div className="axis"><span>1,200</span><span>900</span><span>600</span><span>300</span><span>0</span></div><div className="grid-lines"><i></i><i></i><i></i><i></i><i></i></div>
          <div className="bars">{stages.map((stage) => <button key={stage.name} className={`bar-group ${stage.name === "Stage 2" ? "selected" : ""}`} onClick={() => stage.name === "Stage 2" && setCommentsOpen(!commentsOpen)}><strong>{stage.total.toLocaleString()}</strong><span className="bar" style={{height:`${(stage.total/max)*280}px`}}><i className="drop" style={{height:`${(stage.drop/stage.total)*100}%`}}></i></span><em>{stage.name}</em><small>{stage.loss}</small></button>)}</div>
          <button className="comment-pin" onClick={() => setCommentsOpen(!commentsOpen)}>2</button>
          {commentsOpen && <div className="comments"><div className="comments-head"><strong>Comments <span>2</span></strong><button onClick={() => setCommentsOpen(false)}>×</button></div><div className="comment"><i>H</i><p><strong>Hyewon C. <small>2h</small></strong>Stage 2 drop-off jumped 9pp after the Tuesday patch. Can we tag the release here?</p></div><div className="comment"><i className="rose">J</i><p><strong>Jihyun K. <small>41m</small></strong>Tagged it. @Minseo can you pull the Stage 2 session recordings before Friday?</p></div><div className="reply"><span>Reply or @mention a teammate</span><button onClick={() => {setCommentsOpen(false);flash("Comment resolved");}}>Resolve</button></div></div>}
        </div>
      </section>
      <section className="funnel-card"><h2>New player first-session funnel</h2><div className="funnel-head"><span>Step recorded</span><span>Sessions</span><span>Reach vs first session · 0–100%</span></div>{funnel.map(([label,sessions,percent]) => <div className="funnel-row" key={label}><strong>{label}</strong><span>{sessions}</span><div><em>{percent.toFixed(1)}%</em><span><i style={{width:`${percent}%`}}></i></span></div></div>)}</section></> : active === "Workspace" ? <WorkspacePage setActive={setActive} flash={flash} /> : active === "Members & roles" ? <MembersPage flash={flash} /> : active === "Mapping" || active === "Logging" ? <FlowPage key={active} mode={active} flash={flash} /> : active === "Workspace settings" ? <SettingsPage flash={flash} /> : <AnalyticsPlaceholder active={active} />}
    </main>{shareOpen && <div className="modal-backdrop" onMouseDown={() => setShareOpen(false)}><section className="share-modal" onMouseDown={(e) => e.stopPropagation()}><div><h2>Share dashboard</h2><button onClick={() => setShareOpen(false)}>×</button></div><p>Invite teammates or copy a read-only dashboard link.</p><label>Email address<input placeholder="name@company.com" /></label><div className="share-access"><span>Anyone in H&amp;J Team</span><select><option>Can view</option><option>Can edit</option></select></div><div className="modal-actions"><button onClick={() => flash("Share link copied")}>Copy link</button><button onClick={() => {setShareOpen(false);flash("Invitation sent");}}>Send invite</button></div></section></div>}{notice && <div className="toast">{notice}</div>}
  </div>;
}
