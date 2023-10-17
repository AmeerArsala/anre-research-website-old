import Link from 'next/link';
import Image from 'next/image';
import styles from "./Header.module.css";

export default function Header({ name }) {
  return (
    <header className="pt-20 pb-12">
      {/* ANRE RESEARCH ICON */}
      <div>
        <Image className={styles.circularImage} src="/anre-temp.jpg" width={100} height={100}/>
      </div>

      {/* <div className="w-12 h-12 rounded-full block mx-auto mb-4 bg-gradient-conic from-gradient-3 to-gradient-4" /> */}

      <p className="text-2xl dark:text-white text-center">
        <Link href="/">
          <a>{name}</a>
        </Link>
      </p>
    </header>
  );
}
