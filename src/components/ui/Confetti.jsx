import { useEffect, useState } from "react";

const CONFETTI_COLORS = ["#A855F7", "#C084FC", "#E879F9", "#F5F5F5", "#9333EA"];

export default function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 80 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.45,
        duration: 2.4 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 220,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 7,
      })),
    );
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="forge-confetti-piece absolute top-0 rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.55}px`,
            backgroundColor: piece.color,
            "--confetti-drift": `${piece.drift}px`,
            "--confetti-rotation": `${piece.rotation + 720}deg`,
            "--confetti-duration": `${piece.duration}s`,
            "--confetti-delay": `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
