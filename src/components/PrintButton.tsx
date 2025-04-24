// components/PrintButton.tsx
"use client";

import Image from "next/image";

const PrintButton = () => {
  const handlePrint = () => window.print();

  return (
    <button
      onClick={handlePrint}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow no-print"
    >
      <Image src="/print.png" alt="Print" width={14} height={14} />
    </button>
  );
};

export default PrintButton;