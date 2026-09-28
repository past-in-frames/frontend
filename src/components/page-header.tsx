export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl lg:leading-[1.08]">
        {title}
      </h1>
      {lede ? (
        <p className="m-0 text-[15px] leading-[1.55] text-muted lg:text-[18px] lg:leading-relaxed">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/** Shared page padding for every reader-facing route. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-grow flex-col gap-8 px-[18px] pt-8 pb-12 lg:gap-10 lg:px-16 lg:pt-16 lg:pb-16">
      {children}
    </div>
  );
}
