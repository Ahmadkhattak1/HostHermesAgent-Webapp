import Image from "next/image";

export default function Home() {
  return (
    <main className="page">
      <Image
        className="logo"
        src="/logo.png"
        alt="Hermes agent logo"
        width="128"
        height="128"
        priority
        unoptimized
      />
      <p>Go to Clawpilot.app for hosting hermes agent</p>
    </main>
  );
}
