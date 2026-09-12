import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Signup() {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = t("auth.errors.required");
    if (!form.email.trim()) errs.email = t("auth.errors.required");
    else if (!emailRegex.test(form.email))
      errs.email = t("auth.errors.invalidEmail");
    if (!form.password) errs.password = t("auth.errors.required");
    else if (form.password.length < 8)
      errs.password = t("auth.errors.weakPassword");
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t("auth.errors.passwordMismatch");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      username: form.username,
      firstName: form.username,
    });
    setLoading(false);
    if (error) {
      if (
        error.message?.toLowerCase().includes("already") ||
        error.status === 422
      ) {
        setErrors({ email: t("auth.errors.emailInUse") });
      } else {
        setErrors({ generic: t("auth.errors.generic") });
      }
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="flex items-center gap-2 justify-center mb-8">
          <img
            src="/logo-simple.png"
            alt="Forge your Body"
            className="w-20 h-20 object-contain"
          />
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            {t("auth.signupTitle")}
          </h1>
          <p className="text-sm text-secondary mb-6">
            {t("auth.signupSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.username")}
              value={form.username}
              error={errors.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
            <Input
              label={t("auth.email")}
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={form.password}
              error={errors.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
            <Input
              label={t("auth.confirmPassword")}
              type="password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
            />

            {errors.generic && (
              <p className="text-sm text-red-400">{errors.generic}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? t("common.loading") : t("auth.createMyAccount")}
            </Button>
          </form>

          <p className="text-sm text-secondary text-center mt-6">
            {t("auth.haveAccount")}{" "}
            <Link
              to="/login"
              className="text-accent font-semibold hover:text-accent-hover"
            >
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
