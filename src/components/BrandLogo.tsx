type BrandLogoProps = {
  variant?: "nav" | "auth";
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
};

export default function BrandLogo({
  variant = "nav",
  showText = true,
  showSubtitle = false,
  className = "",
}: BrandLogoProps) {
  const isAuth = variant === "auth";
  const markSize = isAuth ? "h-20 w-20" : "h-11 w-11";
  const textSize = isAuth ? "text-3xl" : "text-xl";

  return (
    <div className={`inline-flex items-center ${isAuth ? "flex-col gap-3 text-center" : "gap-3"} ${className}`}>
      <div className={`${markSize} relative shrink-0 rounded-[1.35rem] bg-gradient-to-br from-rose-300 via-pink-500 to-rose-600 p-[3px] shadow-xl shadow-pink-200/70`}>
        <div className="absolute inset-0 rounded-[1.35rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_32%),linear-gradient(135deg,#fb7185,#db2777)]" />
        <svg viewBox="0 0 64 64" role="img" aria-label="The Nail Lounge logo" className="relative h-full w-full drop-shadow-sm">
          <path d="M32 8c5.6 7.7 5.6 14.2 0 19.6C26.4 22.2 26.4 15.7 32 8Z" fill="white" opacity="0.96" />
          <path d="M50.5 24.5c-6 7.6-12.6 9.2-19.2 4.6 2.4-7.8 8.8-11.2 19.2-4.6Z" fill="white" opacity="0.9" />
          <path d="M44.8 49.5c-9.4-1.3-14.4-6.1-13.5-14.2 8-2.1 13.1 2.9 13.5 14.2Z" fill="white" opacity="0.96" />
          <path d="M19.2 49.5c.4-11.3 5.5-16.3 13.5-14.2.9 8.1-4.1 12.9-13.5 14.2Z" fill="white" opacity="0.96" />
          <path d="M13.5 24.5c10.4-6.6 16.8-3.2 19.2 4.6-6.6 4.6-13.2 3-19.2-4.6Z" fill="white" opacity="0.9" />
          <circle cx="32" cy="32" r="6.4" fill="#ffe4e6" />
          <path d="M42.5 16.5c-6.6 8.5-8 19.8-4.1 33" fill="none" stroke="#fff7ed" strokeWidth="4.2" strokeLinecap="round" opacity="0.95" />
          <path d="M40.9 18.2c2.2.7 3.9 2.3 5.1 4.5" fill="none" stroke="#fecdd3" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
        </svg>
      </div>

      {showText && (
        <div className={isAuth ? "space-y-1" : "leading-tight"}>
          <div className={`${textSize} font-black tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-pink-700 bg-clip-text text-transparent`}>
            Nail Lounge
          </div>
          {(showSubtitle || isAuth) && (
            <div className={`${isAuth ? "text-xs" : "text-[10px]"} font-bold uppercase tracking-[0.28em] text-rose-400`}>
              Stokesley
            </div>
          )}
        </div>
      )}
    </div>
  );
}
