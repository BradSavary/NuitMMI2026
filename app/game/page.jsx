import Link from "next/link";

export default function Game() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      Bienvenue Sur le jeu
       <Link href="/test-gesture" className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-gray-700 transition">
        Accéder au test de gestes
      </Link>
    </div>
    
  );
}
