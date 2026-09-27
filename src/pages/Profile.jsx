import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import ProfileCard from "../components/ProfileCard";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LanguageSelector from "../components/ui/LanguageSelector";
import PageTitle from "../components/ui/PageTitle";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    username: profile?.username || "",
    sex: profile?.sex || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const { error } = await updateProfile({
      ...form,
      sex: form.sex || null,
    });

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="mb-7">
        <PageTitle icon="/ForgeIcons/Profile.png">
          {t("profile.title")}
        </PageTitle>
      </div>

      <ProfileCard profile={profile} />

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 mt-5">
      <section className="card relative isolate overflow-hidden p-5 sm:p-6 border-accent/15">
        <div className="absolute -right-12 -top-20 -z-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <h2 className="relative font-bold text-primary mb-5">{t("profile.personalInfo")}</h2>

        <div className="relative flex flex-col gap-4">
          <Input
            label={t("profile.firstName")}
            value={form.first_name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                first_name: e.target.value,
              }))
            }
          />

          <Input
            label={t("profile.username")}
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                username: e.target.value,
              }))
            }
          />

          <Input
            label={t("profile.email")}
            value={profile?.email || ""}
            disabled
            className="opacity-60 cursor-not-allowed"
          />

          <div>
            <label
              htmlFor="profile-sex"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              {t("profile.sex")}
            </label>

            <select
              id="profile-sex"
              value={form.sex}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sex: e.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-app text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="" className="bg-dark-card">
                {t("profile.sexNotSpecified")}
              </option>

              <option value="male" className="bg-dark-card">
                {t("profile.male")}
              </option>

              <option value="female" className="bg-dark-card">
                {t("profile.female")}
              </option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.loading") : t("profile.saveChanges")}
            </Button>

            {saved && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-medium text-accent">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                  <path d="m4 10 4 4 8-8" />
                </svg>
                {t("profile.changesSaved")}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6 border-accent/15">
        <h2 className="font-bold text-primary mb-5">
          {t("profile.preferences")}
        </h2>

        <div className="mb-5">
          <p className="text-sm font-medium text-secondary mb-2">
            {t("profile.language")}
          </p>

          <LanguageSelector />
        </div>

        <div>
          <p className="text-sm font-medium text-secondary mb-2">
            {t("profile.appearance")}
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              {
                value: "dark",
                label: t("profile.dark"),
                icon: "🌙",
              },
              {
                value: "light",
                label: t("profile.light"),
                icon: "☀️",
              },
              {
                value: "system",
                label: t("profile.system"),
                icon: "💻",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium border transition-all hover:-translate-y-0.5 ${
                  theme === opt.value
                    ? "border-accent text-accent bg-accent/10"
                    : "border-app text-secondary hover:text-primary"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
