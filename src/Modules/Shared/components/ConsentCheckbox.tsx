import { forwardRef } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ConsentCheckbox.module.css";

type ConsentCheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  ({ error, ...inputProps }, ref) => {
    return (
      <div className={styles.container}>
        <label className={styles.label}>
          <input
            type="checkbox"
            ref={ref}
            {...inputProps}
            className={styles.checkbox}
          />
          <span className={styles.text}>
            He leído y acepto el{" "}
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
