import styles from '../styles/Layout.module.css';

export default function Layout_login( { children }){
  return (
    <div className="flex h-screen bg-blue-200">
      <div className="m-auto bg-slate-50 rounded-md w-3/5 h-3/4 grid lg:grid-cols-2"> 
        <div className={styles.imgStyle}> 
          <div className={styles.cartoonImg}></div>
          <div className={styles.cloud_one}></div>
          <div className={styles.cloud_two}></div>
        </div>
        <div className="flex flex-col justify-evenly">
          <div className="text-center py-4">
            {children}
          </div>
        </div>
      </div>
  
    </div>
  )
}