import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!password || !confirmPassword) {
      setError(t("auth.errors.required"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.errors.weakPassword"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }

    setLoading(true);

    const { error: err } = await updatePassword(password);

    setLoading(false);

    if (err) {
      setError(t("auth.errors.generic"));
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-bold text-primary mb-3">
              {t("auth.passwordUpdated")}
            </h1>

            <p className="text-sm text-secondary mb-6">
              {t("auth.passwordUpdatedMessage")}
            </p>

            <Button size="lg" className="w-full" onClick={() => navigate("/")}>
              {t("auth.continue")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            {t("auth.resetPassword")}
          </h1>

          <p className="text-sm text-secondary mb-6">
            {t("auth.resetPasswordSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Input
              label={t("auth.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("common.loading") : t("auth.updatePassword")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
