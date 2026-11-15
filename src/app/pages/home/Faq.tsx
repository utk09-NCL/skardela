import { text } from "../../../text/en";
import styles from "./HomePage.module.css";

const words = text.home.faq;

// The questions that new players ask. The heading and a link to the issues are on the left,
// and the questions are on the right. Each answer opens with a native <details>,
// so it works with a keyboard and a screen reader without more code.
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={styles.faqSection}>
      <div className={styles.faqIntro}>
        <h2 id="faq-heading">{words.heading}</h2>
        <p>
          {words.other}{" "}
          <a href={words.issues.href} target="_blank" rel="noreferrer">
            {words.issues.label}
          </a>
          .
        </p>
      </div>
      <div className={styles.faq}>
        {words.items.map((item) => (
          <details key={item.question} className={styles.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
            {item.link !== undefined && (
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
