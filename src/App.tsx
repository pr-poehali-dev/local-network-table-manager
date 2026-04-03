import { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/3f7267f9-a3d7-4dee-ae15-7f48c8816417";

function useApiData<T>(resource: string, search: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ resource });
      if (search) params.set("search", search);
      const res = await fetch(`${API_URL}?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setError("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [resource, search]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}

type Section = "tables" | "users" | "print" | "export" | "import" | "reports" | "forms" | "settings";

const NAV_ITEMS: { id: Section; label: string; icon: string; badge?: number }[] = [
  { id: "tables", label: "Таблицы", icon: "Table2", badge: 3 },
  { id: "users", label: "Пользователи", icon: "Users", badge: 148 },
  { id: "print", label: "Печать", icon: "Printer" },
  { id: "export", label: "Экспорт", icon: "Download" },
  { id: "import", label: "Импорт", icon: "Upload" },
  { id: "reports", label: "Отчёты", icon: "BarChart3", badge: 5 },
  { id: "forms", label: "Формы", icon: "FileText" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];



type FilterOperator = "содержит" | "равно" | "начинается с" | "не равно" | "пусто" | "не пусто";
interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

const OPERATORS: FilterOperator[] = ["содержит", "равно", "начинается с", "не равно", "пусто", "не пусто"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Активен": "bg-emerald-950 text-emerald-400",
    "Неактивен": "bg-zinc-800 text-zinc-400",
    "Ок": "bg-emerald-950 text-emerald-400",
    "Предупреждение": "bg-amber-950 text-amber-400",
    "Ошибка": "bg-red-950 text-red-400",
    "Готов": "bg-emerald-950 text-emerald-400",
    "Устарел": "bg-amber-950 text-amber-400",
    "Генерация": "bg-blue-950 text-blue-400",
  };
  return (
    <span className={`badge-status ${map[status] ?? "bg-zinc-800 text-zinc-400"}`}>
      {status}
    </span>
  );
}

function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card flex-shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function Btn({ children, variant = "default", size = "sm", onClick, className = "" }: {
  children: React.ReactNode;
  variant?: "default" | "ghost" | "outline" | "danger";
  size?: "sm" | "xs";
  onClick?: () => void;
  className?: string;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-sm transition-colors cursor-pointer border";
  const sizes = { sm: "px-3 py-1.5 text-[12px]", xs: "px-2 py-1 text-[11px]" };
  const variants = {
    default: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    ghost: "bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground",
    outline: "bg-transparent text-foreground border-border hover:bg-muted",
    danger: "bg-transparent text-red-400 border-red-900 hover:bg-red-950",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Поиск..."}
        className="pl-7 pr-3 py-1.5 bg-muted border border-border rounded-sm text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-52"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <Icon name="X" size={12} />
        </button>
      )}
    </div>
  );
}

function FilterPanel({ fields, filters, onChange }: {
  fields: string[];
  filters: FilterRule[];
  onChange: (f: FilterRule[]) => void;
}) {
  const addRule = () => {
    onChange([...filters, { id: Math.random().toString(36).slice(2), field: fields[0], operator: "содержит", value: "" }]);
  };
  const removeRule = (id: string) => onChange(filters.filter(f => f.id !== id));
  const updateRule = (id: string, patch: Partial<FilterRule>) => {
    onChange(filters.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  return (
    <div className="px-5 py-3 border-b border-border bg-muted/30 flex-shrink-0 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Многоуровневые фильтры</span>
        {filters.length > 0 && (
          <button onClick={() => onChange([])} className="text-[11px] text-red-400 hover:text-red-300 transition-colors ml-auto">Очистить все</button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {filters.map((rule, idx) => (
          <div key={rule.id} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-8 text-right font-mono">{idx === 0 ? "ГДЕ" : "И"}</span>
            <select
              value={rule.field}
              onChange={e => updateRule(rule.id, { field: e.target.value })}
              className="bg-card border border-border rounded-sm px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={rule.operator}
              onChange={e => updateRule(rule.id, { operator: e.target.value as FilterOperator })}
              className="bg-card border border-border rounded-sm px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            {rule.operator !== "пусто" && rule.operator !== "не пусто" && (
              <input
                type="text"
                value={rule.value}
                onChange={e => updateRule(rule.id, { value: e.target.value })}
                placeholder="Значение..."
                className="bg-card border border-border rounded-sm px-2 py-1 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36"
              />
            )}
            <button onClick={() => removeRule(rule.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
              <Icon name="Trash2" size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={addRule}
          className="flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors mt-0.5 w-fit"
        >
          <Icon name="Plus" size={12} />
          Добавить условие
        </button>
      </div>
    </div>
  );
}

function applyFilterRules<T extends Record<string, unknown>>(data: T[], search: string, filters: FilterRule[]): T[] {
  return data.filter(row => {
    const matchSearch = !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchFilters = filters.every(rule => {
      const val = String(row[rule.field] ?? "").toLowerCase();
      const rv = rule.value.toLowerCase();
      if (rule.operator === "содержит") return val.includes(rv);
      if (rule.operator === "равно") return val === rv;
      if (rule.operator === "начинается с") return val.startsWith(rv);
      if (rule.operator === "не равно") return val !== rv;
      if (rule.operator === "пусто") return val === "";
      if (rule.operator === "не пусто") return val !== "";
      return true;
    });
    return matchSearch && matchFilters;
  });
}

function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: string; sortDir: "asc" | "desc" }) {
  if (sortCol !== col) return <Icon name="ChevronsUpDown" size={11} className="text-muted-foreground" />;
  return <Icon name={sortDir === "asc" ? "ChevronUp" : "ChevronDown"} size={11} className="text-primary" />;
}

function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}><div className="h-3 bg-muted rounded-sm animate-pulse w-3/4" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TablesSection() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const fields = ["name", "rows", "size", "status", "updated"];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: rawData, loading } = useApiData<Record<string, unknown>>("tables", debouncedSearch);

  const sorted = useMemo(() => {
    const filtered = applyFilterRules(rawData, "", filters);
    return [...filtered].sort((a, b) => {
      const av = a[sortCol]; const bv = b[sortCol];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ru");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rawData, filters, sortCol, sortDir]);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const cols: [string, string][] = [["name", "Имя таблицы"], ["rows", "Записей"], ["size", "Размер"], ["updated", "Обновлено"], ["status", "Статус"]];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <TopBar
        title="Таблицы"
        subtitle={loading ? "Загрузка..." : `${sorted.length} таблиц`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Поиск по таблицам..." />
            <Btn variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(v => !v)}>
              <Icon name="Filter" size={13} />
              Фильтры
              {filters.length > 0 && <span className="ml-1 bg-primary-foreground/20 px-1 rounded-sm">{filters.length}</span>}
            </Btn>
          </>
        }
      />
      {showFilters && <FilterPanel fields={fields} filters={filters} onChange={setFilters} />}
      <div className="flex-1 overflow-auto">
        <table className="data-table w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {cols.map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)} className="cursor-pointer select-none">
                  <div className="flex items-center gap-1">{label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} /></div>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={6} /> : sorted.map(row => (
              <tr key={String(row.id)}>
                <td><span className="font-mono text-primary">{String(row.name)}</span></td>
                <td><span className="font-mono text-muted-foreground">{Number(row.rows).toLocaleString("ru")}</span></td>
                <td><span className="font-mono text-muted-foreground">{String(row.size)}</span></td>
                <td className="text-muted-foreground">{String(row.updated)}</td>
                <td><StatusBadge status={String(row.status)} /></td>
                <td>
                  <div className="flex items-center gap-1">
                    <Btn variant="ghost" size="xs"><Icon name="Eye" size={11} />Просмотр</Btn>
                    <Btn variant="ghost" size="xs"><Icon name="Download" size={11} />Экспорт</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={32} className="mb-3 opacity-40" />
            <p className="text-[13px]">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersSection() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState("Все");
  const roles = ["Все", "Администратор", "Менеджер", "Оператор", "Аналитик"];
  const fields = ["name", "email", "role", "status", "dept", "last_seen"];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: rawData, loading } = useApiData<Record<string, unknown>>("users", debouncedSearch);

  const sorted = useMemo(() => {
    const base = roleFilter === "Все" ? rawData : rawData.filter(u => u.role === roleFilter);
    const filtered = applyFilterRules(base, "", filters);
    return [...filtered].sort((a, b) => {
      const av = a[sortCol]; const bv = b[sortCol];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ru");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rawData, filters, sortCol, sortDir, roleFilter]);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const userCols: [string, string][] = [["name", "Имя"], ["email", "Email"], ["role", "Роль"], ["dept", "Отдел"], ["status", "Статус"], ["last_seen", "Последний вход"]];
  const active = sorted.filter(u => u.status === "Активен").length;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <TopBar
        title="Пользователи"
        subtitle={loading ? "Загрузка..." : `${sorted.length} пользователей · ${active} активных`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Поиск пользователя..." />
            <div className="flex border border-border rounded-sm overflow-hidden">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1.5 text-[12px] transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Btn variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(v => !v)}>
              <Icon name="Filter" size={13} />
              Фильтры
              {filters.length > 0 && <span className="ml-1">{filters.length}</span>}
            </Btn>
            <Btn variant="default"><Icon name="UserPlus" size={13} />Добавить</Btn>
          </>
        }
      />
      {showFilters && <FilterPanel fields={fields} filters={filters} onChange={setFilters} />}
      <div className="flex-1 overflow-auto">
        <table className="data-table w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th><span className="text-muted-foreground">#</span></th>
              {userCols.map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)} className="cursor-pointer select-none">
                  <div className="flex items-center gap-1">{label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} /></div>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={8} /> : sorted.map(user => (
              <tr key={String(user.id)}>
                <td className="text-muted-foreground font-mono text-[11px]">{String(user.id)}</td>
                <td className="font-medium">{String(user.name)}</td>
                <td className="text-muted-foreground font-mono text-[12px]">{String(user.email)}</td>
                <td><span className="bg-secondary text-secondary-foreground badge-status">{String(user.role)}</span></td>
                <td className="text-muted-foreground">{String(user.dept)}</td>
                <td><StatusBadge status={String(user.status)} /></td>
                <td className="text-muted-foreground text-[12px]">{String(user.last_seen)}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <Btn variant="ghost" size="xs"><Icon name="Pencil" size={11} /></Btn>
                    <Btn variant="danger" size="xs"><Icon name="Trash2" size={11} /></Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon name="UserX" size={32} className="mb-3 opacity-40" />
            <p>Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsSection() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const fields = ["name", "type", "status"];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: rawData, loading } = useApiData<Record<string, unknown>>("reports", debouncedSearch);

  const filtered = useMemo(() =>
    applyFilterRules(rawData, "", filters),
    [rawData, filters]
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <TopBar
        title="Отчёты"
        subtitle={loading ? "Загрузка..." : `${filtered.length} отчётов`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Поиск отчёта..." />
            <Btn variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(v => !v)}>
              <Icon name="Filter" size={13} />
              Фильтры
              {filters.length > 0 && <span className="ml-1">{filters.length}</span>}
            </Btn>
            <Btn variant="default"><Icon name="Plus" size={13} />Создать отчёт</Btn>
          </>
        }
      />
      {showFilters && <FilterPanel fields={fields} filters={filters} onChange={setFilters} />}
      <div className="flex-1 overflow-auto">
        <table className="data-table w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Записей</th>
              <th>Обновлено</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={6} /> : filtered.map(r => (
              <tr key={String(r.id)}>
                <td className="font-medium">{String(r.name)}</td>
                <td><span className="bg-secondary text-secondary-foreground badge-status">{String(r.type)}</span></td>
                <td className="font-mono text-muted-foreground">{Number(r.rows).toLocaleString("ru")}</td>
                <td className="text-muted-foreground">{String(r.updated)}</td>
                <td><StatusBadge status={String(r.status)} /></td>
                <td>
                  <div className="flex items-center gap-1">
                    <Btn variant="ghost" size="xs"><Icon name="Eye" size={11} />Открыть</Btn>
                    <Btn variant="ghost" size="xs"><Icon name="Download" size={11} />Скачать</Btn>
                    <Btn variant="ghost" size="xs"><Icon name="Printer" size={11} /></Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <TopBar title="Настройки" subtitle="Параметры системы" />
      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-xl space-y-6">
          <section>
            <h2 className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Интерфейс</h2>
            <div className="space-y-0">
              {[
                { label: "Тема", opts: ["Тёмная", "Светлая", "Системная"], def: "Тёмная" },
                { label: "Язык", opts: ["Русский", "English"], def: "Русский" },
                { label: "Записей на странице", opts: ["25", "50", "100", "200"], def: "50" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-border">
                  <span className="text-[13px]">{s.label}</span>
                  <select defaultValue={s.def} className="bg-muted border border-border rounded-sm px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    {s.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-[13px]">Автосохранение</span>
                <button
                  onClick={() => setAutoSave(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${autoSave ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoSave ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Экспорт по умолчанию</h2>
            <div className="space-y-0">
              {[["Формат файла", ["XLSX", "CSV", "JSON", "PDF"]], ["Кодировка", ["UTF-8", "Windows-1251"]]].map(([label, opts]) => (
                <div key={String(label)} className="flex items-center justify-between py-2.5 border-b border-border">
                  <span className="text-[13px]">{label}</span>
                  <select className="bg-muted border border-border rounded-sm px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <Btn variant="default"><Icon name="Save" size={13} />Сохранить настройки</Btn>
        </div>
      </div>
    </div>
  );
}

function StubSection({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <TopBar title={title} />
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Icon name={icon as never} size={40} className="opacity-20" />
        <p className="text-[14px] font-medium text-foreground/50">{description}</p>
        <Btn variant="outline"><Icon name="Plus" size={13} />Настроить раздел</Btn>
      </div>
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>("tables");
  const [collapsed, setCollapsed] = useState(false);

  const sectionMap: Record<Section, React.ReactNode> = {
    tables: <TablesSection />,
    users: <UsersSection />,
    reports: <ReportsSection />,
    print: <StubSection title="Печать" icon="Printer" description="Настройте шаблоны печати документов" />,
    export: <StubSection title="Экспорт" icon="Download" description="Экспорт данных в XLSX, CSV, JSON, PDF" />,
    import: <StubSection title="Импорт" icon="Upload" description="Загрузка данных из файлов и внешних источников" />,
    forms: <StubSection title="Формы" icon="FileText" description="Конструктор форм для ввода данных" />,
    settings: <SettingsSection />,
  };

  const stats = [
    { label: "Таблиц", value: "12" },
    { label: "Польз.", value: "148" },
    { label: "Отчётов", value: "5" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{width: "100%"}}>
      <aside className={`flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))] transition-all duration-200 flex-shrink-0 ${collapsed ? "w-12" : "w-48"}`}>
        <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="Database" size={13} className="text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-semibold text-[14px] text-foreground tracking-tight">DataHub</span>}
          <button
            onClick={() => setCollapsed(v => !v)}
            className={`text-muted-foreground hover:text-foreground transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}
          >
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={14} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              title={collapsed ? item.label : undefined}
              className={`nav-item w-full ${section === item.id ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon name={item.icon as never} size={15} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${section === item.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-2 border-t border-[hsl(var(--sidebar-border))]">
            <div className="grid grid-cols-3 gap-1">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col items-center py-1.5 rounded-sm bg-[hsl(var(--sidebar-accent))]">
                  <span className="font-mono text-[13px] text-foreground font-medium">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
            <Icon name="Database" size={12} />
            <span className="opacity-40">/</span>
            <span className="text-foreground">{NAV_ITEMS.find(n => n.id === section)?.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Подключено</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Icon name="Clock" size={12} />
              <span className="font-mono">03.04.2026 · 14:32</span>
            </div>
            <div className="w-7 h-7 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
              <Icon name="User" size={14} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {sectionMap[section]}
        </div>
      </main>
    </div>
  );
}