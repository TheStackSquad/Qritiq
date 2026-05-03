// src/components/movies/movieDetails/movieDetailSkeleton.js
import styles from "./movieDetailSkeleton.module.css";

export default function MovieDetailSkeleton() {
  return (
    <div className={styles.mdsRoot}>
      <div className={styles.mdsHero}>
        <div className={styles.mdsPoster} />
        <div className={styles.mdsHeroMeta}>
          <div className={`${styles.mdsLine} ${styles.mdsLineTitle}`} />
          <div className={`${styles.mdsLine} ${styles.mdsLineSub}`} />
          <div className={`${styles.mdsLine} ${styles.mdsLineSub2}`} />
        </div>
      </div>

      <div className={styles.mdsScores}>
        <div className={styles.mdsScorePill} />
        <div className={styles.mdsScorePill} />
      </div>

      <div className={styles.mdsButtons}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.mdsBtn} />
        ))}
      </div>
    </div>
  );
}
