import { forwardRef } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ConsentCheckbox.module.css";

type ConsentCheckboxProps = {
  error?: string;
  onChange?: (checked: boolean) => void;
  checked?: boolean;
};

const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  ({ error, onChange, checked }, ref) => {
    return (
      <div className={styles.container}>
        <label className={styles.label}>
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.text}>
            Acepto el{" "}
            <Link to="/aviso-de-privacidad" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Aviso de Privacidad
            </Link>
          </span>
        </label>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

ConsentCheckbox.displayName = "ConsentCheckbox";

export default ConsentCheckbox;
