import React from "react";

interface StripedPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  patternTransform?: string;
  className?: string;
}

export function StripedPattern({
  width = 40,
  height = 40,
  patternTransform = "rotate(45)",
  className = "",
  ...props
}: StripedPatternProps) {
  const id = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-[#FF6D1F]/5 stroke-[#FF6D1F]/15 ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternTransform={patternTransform}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={height}
            strokeWidth="3"
            className="stroke-[#FF6D1F]/15"
          />
          <line
            x1="10"
            y1="0"
            x2="10"
            y2={height}
            strokeWidth="1.5"
            className="stroke-[#222222]/10"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
