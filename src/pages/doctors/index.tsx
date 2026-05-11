import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useGetDoctors } from "../../../api-client-react/src/index.js";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Video, Search, SlidersHorizontal } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { SpecialtySelector } from "@/components/specialty-selector";
import { useT } from "@/lib/translations";
import { useLanguage } from "@/lib/language";
import { resolveSpecialtyAr } from "@/lib/specialties";

export default function DoctorsList() {
  const t = useT();
  const { lang } = useLanguage();
  const search = useSearch();

  const [specialtyFilter, setSpecialtyFilter] = useState<string | undefined>(() => {
    const params = new URLSearchParams(search);
    return params.get("specialty") || undefined;
  });
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string | undefined>();
  const [immediateOnly, setImmediateOnly] = useState(false);
  const [nameSearch, setNameSearch] = useState("");

  const { data: doctors, isLoading } = useGetDoctors({
    specialty: specialtyFilter,
    type: typeFilter as any,
    sessionType: sessionTypeFilter as any,
    gender: genderFilter as any,
    immediate: immediateOnly ? "true" : undefined,
  });

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    if (!nameSearch.trim()) return doctors;
    const q = nameSearch.toLowerCase();
    return doctors.filter(d => 
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || 
      d.specialty.some(s => s.toLowerCase().includes(q))
    );
  }, [doctors, nameSearch]);

  const clearAll = () => {
    setSpecialtyFilter(undefined);
    setTypeFilter(undefined);
    setGenderFilter(undefined);
    setSessionTypeFilter(undefined);
    setImmediateOnly(false);
    setNameSearch("");
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-8 border-b">
        <div className="container px-4 mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t("docs_title")}</h1>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("docs_searchPlaceholder")}
              value={nameSearch}
              onChange={e => setNameSearch(e.target.value)}
              className="ps-9"
              data-testid="input-doctor-search"
            />
          </div>

          {/* Connected Specialty Dropdowns */}
          <div className="mb-4">
            <SpecialtySelector
              value={specialtyFilter}
              onChange={setSpecialtyFilter}
              showLabels
              className="max-w-xl"
            />
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3 items-center pt-3 border-t border-border/60">
            <div className="flex items-center gap-1 text-sm text-muted-foreground me-1">
              <SlidersHorizontal className="h-4 w-4" /> {t("docs_filters")}
            </div>

            {/* Gender */}
            <div className="flex gap-1">
              {([
                { labelKey: "docs_anyGender" as const, value: undefined },
                { labelKey: "docs_male" as const, value: "male" },
                { labelKey: "docs_female" as const, value: "female" },
              ]).map(opt => (
                <Button
                  key={String(opt.value)}
                  size="sm"
                  variant={genderFilter === opt.value ? "default" : "outline"}
                  onClick={() => setGenderFilter(opt.value)}
                  data-testid={`button-filter-gender-${opt.value ?? "all"}`}
                  className="h-8 text-xs"
                >
                  {t(opt.labelKey)}
                </Button>
              ))}
            </div>

            {/* Session Type */}
            <div className="flex gap-1">
              {([
                { labelKey: "docs_anySession" as const, value: undefined },
                { labelKey: "docs_individual" as const, value: "individual" },
                { labelKey: "docs_group" as const, value: "group" },
              ]).map(opt => (
                <Button
                  key={String(opt.value)}
                  size="sm"
                  variant={sessionTypeFilter === opt.value ? "default" : "outline"}
                  onClick={() => setSessionTypeFilter(opt.value)}
                  data-testid={`button-filter-session-${opt.value ?? "all"}`}
                  className="h-8 text-xs"
                >
                  {t(opt.labelKey)}
                </Button>
              ))}
            </div>

            {/* Toggles */}
            <Button
              size="sm"
              variant={immediateOnly ? "default" : "outline"}
              onClick={() => setImmediateOnly(!immediateOnly)}
              data-testid="button-filter-immediate"
              className="h-8 text-xs"
            >
              <Clock className="w-3 h-3 me-1" /> {t("docs_availableNow")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 mx-auto py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredDoctors || filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">{t("docs_noFound")}</h3>
            <p className="text-muted-foreground">{t("docs_tryAdjusting")}</p>
            <Button variant="outline" className="mt-4" onClick={clearAll}>
              {t("docs_clearFilters")}
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {t("docs_showing")}{" "}
              <span className="font-semibold text-foreground">{filteredDoctors.length}</span>{" "}
              {filteredDoctors.length !== 1 ? t("docs_specialists") : t("docs_specialist")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden hover-elevate transition-all duration-300 flex flex-col h-full">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10 shrink-0">
                          <AvatarImage src={doctor.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                            {getInitials(`${doctor.firstName} ${doctor.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg leading-tight">{doctor.firstName} {doctor.lastName}</h3>
                          <p className="text-sm text-primary font-medium">
                            {lang === "ar" 
                              ? doctor.specialty.map(s => resolveSpecialtyAr(s)).join(" ، ") 
                              : doctor.specialty.join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {({ psychiatrist: t("reg_psychiatrist"), psychologist: t("reg_psychologist") } as Record<string,string>)[doctor.type] ?? doctor.type}
                            {" · "}
                            {({ male: t("reg_male"), female: t("reg_female") } as Record<string,string>)[doctor.gender] ?? doctor.gender}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {doctor.isOnline && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-xs">
                            <Clock className="w-3 h-3 me-1" /> {t("docs_availableNow")}
                          </Badge>
                        )}
                      </div>

                      {doctor.yearsExperience && (
                        <p className="text-xs text-muted-foreground mb-4">
                          {doctor.yearsExperience} {t("docs_yrsExperience")} · {doctor.languages?.join(", ") || "Arabic"}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t mt-auto">
                        <div>
                          <div className="flex items-center text-sm font-medium mb-0.5">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 me-1" />
                            {doctor.rating} <span className="text-muted-foreground ms-1 font-normal">({doctor.reviewCount})</span>
                          </div>
                          <div className="font-bold">EGP {doctor.price} <span className="text-xs text-muted-foreground font-normal">{t("docs_perSession")}</span></div>
                        </div>
                        <Link href={`/doctors/${doctor.id}`}>
                          <Button data-testid={`button-book-${doctor.id}`}>{t("docs_bookNow")}</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
