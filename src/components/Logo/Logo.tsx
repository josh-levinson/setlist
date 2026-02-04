import styles from "./Logo.module.css";

interface LogoProps {
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

export function Logo({ showText = true, size = "medium" }: LogoProps) {
  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.icon}>
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.accent}`} />
        <div className={styles.line} />
        <div className={styles.line} />
      </div>
      {showText && <span className={styles.text}>setlist</span>}
    </div>
  );
}
