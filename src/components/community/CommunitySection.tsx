interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function CommunitySection({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {children}

    </section>
  );
}