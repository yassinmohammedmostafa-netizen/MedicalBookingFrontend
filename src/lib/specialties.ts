/**
 * SPECIALTIES — flat list of mental-health sub-specialties.
 *
 * The site is mental-health only. Doctor "type" (Psychiatrist / Psychologist)
 * is captured separately, so we no longer split specialties by main category.
 *
 * The `en` value is what is stored in the database as the doctor's specialty.
 */

export interface SubSpecialty {
  en: string;
  ar: string;
}

export const SPECIALTIES: SubSpecialty[] = [
  { en: "Anxiety & Stress",       ar: "القلق والتوتر" },
  { en: "Depression",             ar: "الاكتئاب" },
  { en: "OCD",                    ar: "الوسواس القهري" },
  { en: "ADHD",                   ar: "اضطراب فرط الحركة وتشتت الانتباه" },
  { en: "Trauma & PTSD",          ar: "الصدمات النفسية واضطراب ما بعد الصدمة" },
  { en: "Addiction",              ar: "الإدمان" },
  { en: "Relationships",          ar: "العلاقات" },
  { en: "Child & Adolescent",     ar: "الأطفال والمراهقين" },
  { en: "Family Therapy",         ar: "العلاج الأسري" },
  { en: "Eating Disorders",       ar: "اضطرابات الأكل" },
  { en: "Bipolar Disorder",       ar: "اضطراب ثنائي القطب" },
  { en: "Schizophrenia & Psychosis", ar: "الفصام والذهان" },
  { en: "Sleep Disorders",        ar: "اضطرابات النوم" },
  { en: "Grief & Loss",           ar: "الحزن والفقد" },
  { en: "Mood Disorders",         ar: "اضطرابات المزاج" },
  { en: "Anger Management",       ar: "إدارة الغضب" },
  { en: "Self-Esteem",            ar: "الثقة بالنفس" },
  { en: "Medication Management",  ar: "متابعة الأدوية النفسية" },
  { en: "General Psychiatry",     ar: "الطب النفسي العام" },
];

/** Returns the flat list of all sub-specialty English names. */
export function getAllSubSpecialties(): string[] {
  return SPECIALTIES.map(s => s.en);
}

/**
 * Given a specialty English string, returns the Arabic translation.
 * Falls back to the original value if no match is found.
 */
export function resolveSpecialtyAr(enValue: string): string {
  const sub = SPECIALTIES.find(s => s.en === enValue);
  return sub ? sub.ar : enValue;
}
