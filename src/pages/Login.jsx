import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LanguageSelector from "../components/ui/LanguageSelector";
import PageTitle from "../components/ui/PageTitle";

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t("auth.errors.required"));
      return;
    }
    setLoading(true);
    const { error: err } = await signIn({ email, password });
    setLoading(false);
    if (err) {
      const errorMessage = err.message?.toLowerCase() || "";

      if (
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("email_not_confirmed") ||
        errorMessage.includes("confirm your email")
      ) {
        setError(t("auth.errors.emailNotConfirmed"));
      } else {
        setError(t("auth.errors.invalidCredentials"));
      }

      return;
    }
    navigate("/");
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMsg("");

    if (!email) {
      setError(t("auth.errors.required"));
      return;
    }

    const { error: err } = await resetPassword(email);

    if (err) {
      setError(t("auth.errors.generic"));
      return;
    }

    setResetMsg(t("auth.resetSent"));
  };

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="flex items-center gap-2 justify-center mb-8">
          <img
            src="/logo-simple.png"
            alt="Forge"
            className="w-20 h-20 object-contain"
          />
        </div>

        <div className="card p-8">
          <PageTitle icon="/ForgeIcons/Profile.png" className="mb-2">
            {t("auth.welcome")}
          </PageTitle>
          <p className="text-sm text-secondary mb-6">
            {t("auth.loginSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {resetMsg && <p className="text-sm text-accent">{resetMsg}</p>}

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-secondary hover:text-primary text-left -mt-1"
            >
              {t("auth.forgotPassword")}
            </button>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? t("common.loading") : t("auth.login")}
            </Button>
          </form>

          <p className="text-sm text-secondary text-center mt-6">
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="text-accent font-semibold hover:text-accent-hover"
            >
              {t("auth.createAccount")}
            </Link>
          </p>

          <p className="text-sm text-center mt-4">
            <Link
              to="/preview"
              className="text-secondary hover:text-accent transition-colors"
            >
              {t("preview.exploreWithoutAccount")}
            </Link>
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}
