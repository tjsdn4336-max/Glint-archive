/**
 * GlintLogo — SVG approximation of the Glint Archive brand mark.
 * Crested gecko head (right-facing profile) inside a G-shaped arc.
 * "GLINT" bold serif + "ARCHIVE" spaced small caps below.
 */
interface Props {
  size?: number;      // overall height px
  showText?: boolean; // show GLINT ARCHIVE text beneath icon
  className?: string;
}

export default function GlintLogo({ size = 40, showText = true, className = '' }: Props) {
  const iconSize = size;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: gecko head in G-arc */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Glint Archive 로고"
      >
        {/* Outer G-arc — open bottom-right ~300° */}
        <path
          d="M 82 50
             A 32 32 0 1 0 70 76"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* G crossbar */}
        <line x1="56" y1="50" x2="82" y2="50" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />

        {/* Crested gecko head — right-facing profile */}
        {/* Body/neck curve */}
        <path
          d="M 38 65 C 42 60 50 58 56 52 C 60 48 58 40 54 38"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Head shape */}
        <path
          d="M 54 38 C 56 34 64 32 68 35 C 72 38 70 44 66 46 C 62 48 56 46 54 38 Z"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Snout tip */}
        <path
          d="M 68 35 C 72 33 75 35 74 38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Eye */}
        <circle cx="63" cy="38" r="2.8" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="63" cy="38" r="1.2" fill="currentColor" />
        {/* Crest frills — top of head */}
        <path
          d="M 58 34 C 56 28 52 26 50 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 62 33 C 61 27 59 24 58 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 66 33 C 67 27 67 24 66 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Nostril */}
        <circle cx="72" cy="36" r="1" fill="currentColor" />
      </svg>

      {/* Text block */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-display font-bold tracking-wide text-zinc-100"
            style={{ fontSize: size * 0.45 }}
          >
            GLINT
          </span>
          <span
            className="tracking-[0.3em] text-zinc-500 font-medium uppercase"
            style={{ fontSize: size * 0.22, marginTop: size * 0.04 }}
          >
            ARCHIVE
          </span>
        </div>
      )}
    </div>
  );
}
