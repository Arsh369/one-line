import { useEffect } from "react";

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#101010] text-white animate-[fadeIn_0.3s_ease-out]">
      <div className="text-center animate-[logoReveal_0.7s_ease-out]">
        <h1 className="text-[2.5rem] font-extrabold tracking-[5px]">ONE LINE</h1>
        <p className="text-[#999999] text-[0.9rem] tracking-[1px]">Connect. Solve. Repeat.</p>
      </div>
    </div>
  );
}

