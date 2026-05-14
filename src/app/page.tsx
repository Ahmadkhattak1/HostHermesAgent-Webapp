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
      <p>
        We merged with <a href="https://clawpilot.app">Clawpilot.app</a>. You
        can go there to host your agent.
      </p>
    </main>
  );
}
