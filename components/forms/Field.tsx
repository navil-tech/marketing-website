import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute, JSX } from "react";
import styles from "./Field.module.css";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  hint: string;
  type: HTMLInputTypeAttribute;
  autoComplete: HTMLInputAutoCompleteAttribute;
  placeholder: string;
  required: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  required: boolean;
}

export function TextField({
  id,
  name,
  label,
  hint,
  type,
  autoComplete,
  placeholder,
  required,
}: TextFieldProps): JSX.Element {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint !== "" && <span className={styles.hint}> {hint}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className={styles.input}
      />
    </div>
  );
}

export function SelectField({ id, name, label, placeholder, options, required }: SelectFieldProps): JSX.Element {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} name={name} required={required} defaultValue="" className={styles.select}>
        <option value="">{placeholder}</option>
        {options.map((option: SelectOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
