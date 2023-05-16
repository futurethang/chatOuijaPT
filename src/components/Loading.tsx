import styles from '@/styles/Loading.module.scss';

const Loading = () => {
  return (
    <div className={styles.dotsLoading}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Loading;
