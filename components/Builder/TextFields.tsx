"use client";

type FieldConfig<TKey extends string> = {
  key: TKey;
  label: string;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
};

type TextFieldsProps<TKey extends string> = {
  fields: Record<TKey, string>;
  onChange: (key: TKey, value: string) => void;
  fieldConfig: Array<FieldConfig<TKey>>;
};

export default function TextFields<TKey extends string>({
  fields,
  onChange,
  fieldConfig,
}: TextFieldsProps<TKey>) {
  return (
    <div className="mt-4 grid gap-4">
      {fieldConfig.map((field) => {
        const value = fields[field.key];
        const inputClassName =
          "mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted-ink)] focus:border-[var(--brand-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]";

        return (
          <label
            key={field.key}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]"
          >
            {field.label}
            {field.multiline ? (
              <textarea
                value={value}
                maxLength={field.maxLength}
                rows={3}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className={`${inputClassName} resize-none`}
              />
            ) : (
              <input
                value={value}
                maxLength={field.maxLength}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className={inputClassName}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

export type { FieldConfig };
