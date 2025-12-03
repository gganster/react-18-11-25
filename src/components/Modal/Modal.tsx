import s from './Modal.module.css';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
}

export const Modal = ({children, onClose}: ModalProps) => {
  return (
    <div>
      <div className={s.overlay} onClick={onClose}></div>
      <div className={s.modal}>
        <button className={s.closeButton} onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  )
}