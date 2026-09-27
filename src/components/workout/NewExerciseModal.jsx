import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

const INITIAL_FORM = {
  name: "",
  muscle_group: "chest",
  description: "",
};

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "abs",
  "glutes",
  "cardio",
  "other",
];

export default function NewExerciseModal({ open, onClose, onSave, t }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const close = () => {
    setForm(INITIAL_FORM);
    setError(false);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim() || saving) return;

    setSaving(true);
    setError(false);

    try {
      const result = await onSave(form);
      if (result?.error) {
        setError(true);
        return;
      }

      close();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={t("exercises.addExercise")}>
      <div className="flex flex-col gap-4">
        <Input
          label={t("exercises.name")}
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />

        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            {t("exercises.muscleGroup")}
          </label>
          <select
            value={form.muscle_group}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                muscle_group: event.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-btn bg-transparent border border-app text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group} className="bg-dark-card">
                {t(`exercises.muscleGroups.${group}`)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {t("auth.errors.generic")}
          </p>
        )}

        <Button onClick={handleSave} disabled={!form.name.trim() || saving}>
          {saving ? t("common.loading") : t("common.add")}
        </Button>
      </div>
    </Modal>
  );
}
