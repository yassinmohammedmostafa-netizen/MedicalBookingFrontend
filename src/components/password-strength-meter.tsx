import { useState, useEffect } from "react";
import { useT } from "@/lib/translations";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password = "", className = "" }: PasswordStrengthMeterProps) {
  const t = useT();
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const newCriteria = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    setCriteria(newCriteria);

    const activeCount = Object.values(newCriteria).filter(Boolean).length;
    // Strength is 0 to 100
    setStrength((activeCount / 5) * 100);
  }, [password]);

  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (strength <= 20) return t("pw_strength_weak") || "Weak";
    if (strength <= 40) return t("pw_strength_fair") || "Fair";
    if (strength <= 60) return t("pw_strength_good") || "Good";
    if (strength <= 80) return t("pw_strength_strong") || "Strong";
    return t("pw_strength_veryStrong") || "Very Strong";
  };

  const getStrengthColor = () => {
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  if (!password && password.length === 0) return null;

  return (
    <div className={`space-y-3 pt-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">
          {t("pw_strength") || "Password Strength"}:
        </span>
        <span className={`text-xs font-bold ${strength <= 40 ? "text-red-500" : strength <= 60 ? "text-yellow-600" : "text-green-600"}`}>
          {getStrengthLabel()}
        </span>
      </div>
      
      <Progress value={strength} className="h-1.5" indicatorClassName={getStrengthColor()} />

      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
        <Criterion label={t("pw_crit_length") || "At least 8 chars"} met={criteria.length} />
        <Criterion label={t("pw_crit_lower") || "Lowercase (a-z)"} met={criteria.lowercase} />
        <Criterion label={t("pw_crit_upper") || "Uppercase (A-Z)"} met={criteria.uppercase} />
        <Criterion label={t("pw_crit_number") || "Number (0-9)"} met={criteria.number} />
        <Criterion label={t("pw_crit_special") || "Special char (!@#)"} met={criteria.special} />
      </div>
    </div>
  );
}

function Criterion({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <X className="w-3 h-3 text-muted-foreground/40" />
      )}
      <span className={`text-[10px] ${met ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}
