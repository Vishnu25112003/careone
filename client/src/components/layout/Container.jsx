export default function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 ${className}`}>
      {children}
    </div>
  );
}
