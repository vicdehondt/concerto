import styles from "@/styles/Tag.module.css";

function Tag({ text }: { text: string }) {
  return (
    <div className={styles.tag}>
      <div className={styles.text}>{text}</div>
    </div>
  );
}

export default Tag;
