import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Link href="/game" className="rounded-md bg-black px-4 py-2 text-white">
        Accéder au jeu
      </Link>

    </div>
  );
}
