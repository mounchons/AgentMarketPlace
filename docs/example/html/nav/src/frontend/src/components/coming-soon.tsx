"use client";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary max-w-md">
        {description || "ฟีเจอร์นี้อยู่ระหว่างการพัฒนา จะพร้อมใช้งานเร็วๆ นี้"}
      </p>
    </div>
  );
}
