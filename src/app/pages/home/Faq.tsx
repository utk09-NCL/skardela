import { useTranslation } from "react-i18next";
import styles from "./HomePage.module.css";

// The questions that new players ask. Each answer opens with a native <details>,
// so it works with a keyboard and a screen reader without more code.
export function Faq() {
  const { t } = useTranslation();
  const items = t(($) => $.home.faq.items, { returnObjects: true });
  return (
    <section id="faq" aria-labelledby="faq-heading" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 id="faq-heading">{t(($) => $.home.faq.heading)}</h2>
      </div>
      <div className={styles.faq}>
        {items.map((item) => (
          <details key={item.question} className={styles.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
            {"link" in item && (
              <p>
                <a href={item.link.href} target="_blank" rel="noreferrer">
                  {item.link.label}
                </a>
              </p>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
