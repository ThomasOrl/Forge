export default function CyclePageHeader({ t }) {
  return (
    <div className="relative mb-7">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">
        {t("cycle.title")}
      </h1>

      <p className="text-secondary mt-1">{t("cycle.subtitle")}</p>
    </div>
  );
}
