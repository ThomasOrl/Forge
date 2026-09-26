export default function CycleFlower() {
  return (
    <div
      className="pointer-events-none absolute -top-20 right-0 sm:-top-24 sm:-right-4 w-[250px] h-[170px] sm:w-[330px] sm:h-[220px]"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        {/* Halo diffus */}
        <div
          className="absolute right-8 top-4 w-40 h-32 sm:w-56 sm:h-44 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(236,72,153,0.18) 45%, transparent 75%)",
          }}
        />

        {/* Pétale supérieur */}
        <div
          className="absolute right-16 -top-16 w-28 h-40 sm:right-24 sm:-top-20 sm:w-36 sm:h-52 rounded-[55%] rotate-[28deg]"
          style={{
            background:
              "linear-gradient(145deg, rgba(216,180,254,0.16), rgba(168,85,247,0.08) 55%, rgba(236,72,153,0.03))",
            border: "1px solid rgba(216,180,254,0.08)",
            boxShadow: "0 0 35px rgba(168,85,247,0.06)",
          }}
        />

        {/* Pétale droit */}
        <div
          className="absolute -right-8 top-0 w-32 h-24 sm:-right-10 sm:top-2 sm:w-44 sm:h-32 rounded-[60%] rotate-[18deg]"
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.07), rgba(168,85,247,0.02))",
            border: "1px solid rgba(192,132,252,0.07)",
            boxShadow: "0 0 30px rgba(168,85,247,0.05)",
          }}
        />

        {/* Pétale inférieur */}
        <div
          className="absolute right-12 top-16 w-36 h-20 sm:right-20 sm:top-20 sm:w-48 sm:h-28 rounded-[60%] rotate-[-18deg]"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.10), rgba(168,85,247,0.02))",
            border: "1px solid rgba(236,72,153,0.06)",
          }}
        />

        {/* Petit cœur lumineux */}
        <div
          className="absolute right-[76px] top-[42px] sm:right-[104px] sm:top-[56px] w-3 h-3 sm:w-4 sm:h-4 rounded-full blur-[2px]"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.7) 0%, rgba(168,85,247,0.35) 45%, transparent 75%)",
          }}
        />
      </div>
    </div>
  );
}
