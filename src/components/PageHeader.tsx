interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 max-w-4xl">
        <h1 className="break-words font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{children}</div> : null}
    </div>
  );
}
