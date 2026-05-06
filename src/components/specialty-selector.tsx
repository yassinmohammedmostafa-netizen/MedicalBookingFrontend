import { SPECIALTIES } from "@/lib/specialties";
import { useT } from "@/lib/translations";
import { useLanguage } from "@/lib/language";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpecialtySelectorProps {
  value?: string | string[];
  onChange: (val: any) => void;
  showLabels?: boolean;
  className?: string;
  multi?: boolean;
  disabled?: boolean;
}

const ALL = "__all__";

export function SpecialtySelector({
  value,
  onChange,
  showLabels = true,
  className = "",
  multi = false,
  disabled = false,
}: SpecialtySelectorProps) {
  const t = useT();
  const { lang } = useLanguage();

  if (multi) {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    const handleToggle = (specialtyEn: string, checked: boolean) => {
      if (checked) {
        onChange([...selected, specialtyEn]);
      } else {
        onChange(selected.filter(s => s !== specialtyEn));
      }
    };

    return (
      <div className={`space-y-3 ${className}`}>
        {showLabels && (
          <Label className="text-sm font-semibold">
            {t("admin_specialties")}
          </Label>
        )}
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-background">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIALTIES.map(s => (
              <div key={s.en} className="flex items-start space-x-2 space-x-reverse">
                <Checkbox 
                  id={`spec-${s.en}`}
                  checked={selected.includes(s.en)}
                  onCheckedChange={(checked) => handleToggle(s.en, !!checked)}
                  disabled={disabled}
                />
                <Label 
                  htmlFor={`spec-${s.en}`}
                  className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {lang === "ar" ? s.ar : s.en}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Single select mode
  const singleValue = Array.isArray(value) ? value[0] : value;
  const handleChange = (val: string) => {
    onChange(val === ALL ? undefined : val);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabels && (
        <Label className="text-xs font-medium text-muted-foreground">
          {t("docs_specialty")}
        </Label>
      )}
      <Select value={singleValue ?? ALL} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={t("docs_specialtyPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("docs_allSpecialties")}</SelectItem>
          {SPECIALTIES.map(s => (
            <SelectItem key={s.en} value={s.en}>
              {lang === "ar" ? s.ar : s.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
