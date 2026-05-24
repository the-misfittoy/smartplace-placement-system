/**
 * src/components/ui/StatusBadge.jsx
 */
import { CheckCircle2, Clock, XCircle, Award, Calendar } from "lucide-react";
import { T } from "@/tokens";

export function StatusBadge({ status }) {
  const MAP = {
    pending:        { label:"Pending",      color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Clock        },
    selected:       { label:"Selected",     color:T.success, bg:T.successDim, border:T.successBorder, Icon:CheckCircle2 },
    rejected:       { label:"Rejected",     color:T.danger,  bg:T.dangerDim,  border:T.dangerBorder,  Icon:XCircle      },
    placed:         { label:"Placed",       color:T.success, bg:T.successDim, border:T.successBorder, Icon:Award        },
    not_placed:     { label:"Not Placed",   color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Clock        },
    "not placed":   { label:"Not Placed",   color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Clock        },
    dream_placed:   { label:"Dream Placed", color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Award        },
    "dream placed": { label:"Dream Placed", color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Award        },
    upcoming:       { label:"Upcoming",     color:T.info,    bg:T.infoDim,    border:T.infoBorder,    Icon:Calendar     },
    ongoing:        { label:"Ongoing",      color:T.amber,   bg:T.amberDim,   border:T.amberBorder,   Icon:Clock        },
    completed:      { label:"Completed",    color:T.success, bg:T.successDim, border:T.successBorder, Icon:CheckCircle2 },
    accepted:       { label:"Accepted",     color:T.success, bg:T.successDim, border:T.successBorder, Icon:CheckCircle2 },
    declined:       { label:"Declined",     color:T.danger,  bg:T.dangerDim,  border:T.dangerBorder,  Icon:XCircle      },
    pass:           { label:"Pass",         color:T.success, bg:T.successDim, border:T.successBorder, Icon:CheckCircle2 },
    fail:           { label:"Fail",         color:T.danger,  bg:T.dangerDim,  border:T.dangerBorder,  Icon:XCircle      },
  };

  const cfg = MAP[status?.toLowerCase()] || {
    label:  status ?? "Unknown",
    color:  "#A8A29E",
    bg:     "transparent",
    border: "#3D3935",
    Icon:   Clock,
  };

  const { Icon } = cfg;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11.5, fontWeight: 500, color: cfg.color,
    }}>
      <Icon size={11} />
      {cfg.label}
    </div>
  );
}