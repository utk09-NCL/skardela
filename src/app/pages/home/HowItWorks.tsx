import { useTranslation } from "react-i18next";
import styles from "./HomePage.module.css";

// Three steps from the first visit to the next day. The list is ordered, so the CSS shows the step numbers.
export function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 id="how-it-works-heading">{t(($) => $.home.steps.heading)}</h2>
      </div>
      <ol className={styles.steps}>
        {t(($) => $.home.steps.items, { returnObjects: true }).map((step) => (
          <li key={step.title} className={styles.step}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
