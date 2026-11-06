export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      <h1 className="m-0 font-serif text-[40px] leading-[1.05] font-bold tracking-[-0.01em] lg:text-[56px] lg:leading-[1.05]">
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
    <div className="mx-auto flex w-full max-w-[1200px] flex-grow flex-col gap-8 px-4 pt-8 pb-12 sm:px-6 lg:gap-10 lg:px-10 lg:pt-10 lg:pb-16">
      {children}
    </div>
  );
}
