interface HeroItemProps {
  title: string;
  description: string;
  icon: string;
}

interface ListProps {
  children: React.ReactNode;
}

export const List = ({ children }: ListProps) => {
  return (
    <section aria-labelledby="hero-features-heading">
      <h2 id="hero-features-heading" className="sr-only">
        App Highlights
      </h2>
      <ul className="grid gap-4">{children}</ul>
    </section>
  );
};

export const Item = ({ title, description, icon }: HeroItemProps) => {
  return (
    <li className="rounded-md shadow-sm px-6 py-4">
      <div className="inline-flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-slate-600">{description}</p>
    </li>
  );
};
