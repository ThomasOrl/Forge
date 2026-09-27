import PageTitle from "../ui/PageTitle";

export default function CyclePageHeader({ t }) {
  return (
    <div className="relative mb-7">
      <PageTitle icon="/ForgeIcons/cycle.png">
        {t("cycle.title")}
      </PageTitle>

      <p className="text-secondary mt-1">{t("cycle.subtitle")}</p>
    </div>
  );
}
