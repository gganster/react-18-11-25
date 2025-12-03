import styles from './Button.module.css';
import type { PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<{
  onClick: () => void;
}>

export const Button = ({children, onClick} : ButtonProps) => (
  <button className={styles.button} onClick={() => onClick(1)}>
    {children}
  </button>
);