import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import ProfileCard from "../components/ProfileCard";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LanguageSelector from "../components/ui/LanguageSelector";

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
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("profile.title")}
      </h1>

      <ProfileCard profile={profile} />

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-primary mb-4">{t("profile.title")}</h3>

        <div className="flex flex-col gap-4">
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

          <div className="flex items-center gap-3 mt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.loading") : t("profile.saveChanges")}
            </Button>

            {saved && (
              <span className="text-sm text-accent">
                {t("profile.changesSaved")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-primary mb-4">
          {t("profile.preferences")}
        </h3>

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

          <div className="flex gap-2">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium border transition-colors ${
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
      </div>
    </div>
  );
}
