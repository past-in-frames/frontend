"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const control =
  "w-full rounded-[10px] border border-ink/20 bg-white font-sans text-[15px] font-normal text-ink outline-none transition-colors placeholder:text-pale focus:border-accent-2 aria-invalid:border-rust";

type ShellProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Keeps the label for screen readers where the context already names it. */
  hideLabel?: boolean;
  className?: string;
};

function Shell({
  id,
  label,
  hint,
  error,
  required,
  hideLabel,
  count,
  className,
  children,
}: ShellProps & {
  id: string;
  count?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div
        className={`flex items-baseline justify-between gap-3 ${
          hideLabel ? "sr-only" : ""
        }`}
      >
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
          {required ? (
            <span className="text-rust" aria-hidden="true">
              {" *"}
            </span>
          ) : null}
        </label>
        {count ? (
          <span className="text-xs tabular-nums text-faded">{count}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-message`} className="m-0 text-[13px] text-rust">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-message`} className="m-0 text-[13px] text-faded">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function remaining(value: string, max: number | undefined) {
  if (!max) return undefined;
  // Only worth the noise once the limit is in sight.
  return value.length > max * 0.8 ? `${value.length} / ${max}` : undefined;
}

export function TextField({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  value,
  onChange,
  ...input
}: ShellProps & {
  value: string;
  onChange: (value: string) => void;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  >) {
  const id = useId();

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={className}
      count={remaining(value, input.maxLength)}
    >
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={`${control} h-11 px-4`}
        {...input}
      />
    </Shell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  controlClass,
  value,
  onChange,
  ...area
}: ShellProps & {
  value: string;
  onChange: (value: string) => void;
  /** Lets headings look like headings while editing. */
  controlClass?: string;
} & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "className"
  >) {
  const id = useId();
  const ref = useAutoGrow(value);

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={className}
      count={remaining(value, area.maxLength)}
    >
      <textarea
        id={id}
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={`${control} resize-none px-4 py-3 leading-relaxed ${
          controlClass ?? ""
        }`}
        {...area}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  value,
  onChange,
  children,
  ...select
}: ShellProps & {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
} & Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange" | "className" | "children"
  >) {
  const id = useId();

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-message` : undefined}
        className={`${control} h-11 px-3`}
        {...select}
      >
        {children}
      </select>
    </Shell>
  );
}

/** Grows with its text so long paragraphs stay readable while editing. */
function useAutoGrow(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Reset first so the box shrinks back on delete; `rows` sets the floor.
    element.style.height = "auto";
    if (element.scrollHeight > element.clientHeight) {
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [value]);

  return ref;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: ReactNode;
  className?: string;
}) {
  const name = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex h-11 gap-1 rounded-[10px] border border-ink/20 bg-white p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-[7px] text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-accent-2/40 ${
              option.value === value
                ? "bg-accent-2 text-white"
                : "text-muted hover:bg-ink/5"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint ? <p className="m-0 text-[13px] text-faded">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-accent-2"
      />
      {label}
    </label>
  );
}

const variants = {
  primary: "bg-accent-2 text-white hover:bg-accent-2-dark",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink/40",
  quiet: "text-muted hover:bg-ink/5 hover:text-ink",
  danger: "text-rust hover:bg-rust/10",
};

export function Button({
  variant = "outline",
  size = "medium",
  className,
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: "medium" | "small";
}) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        size === "small" ? "h-8 px-2.5 text-[13px]" : "h-10 px-4 text-sm"
      } ${variants[variant]} ${className ?? ""}`}
      {...button}
    />
  );
}

export function FormSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white/50 p-4 lg:p-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="m-0 font-serif text-[22px] font-semibold">{title}</h2>
        {description ? (
          <p className="m-0 text-[13px] text-faded">{description}</p>
        ) : null}
        {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Note({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: ReactNode;
}) {
  return (
    <p
      className={`m-0 rounded-[10px] px-3 py-2 text-[13px] ${
        tone === "warning"
          ? "bg-accent/15 text-muted"
          : "bg-ink/5 text-faded"
      }`}
    >
      {children}
    </p>
  );
}
