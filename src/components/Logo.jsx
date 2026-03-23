export default function Logo({ className = "" }) {
  return (
      <img
        src="/logo2.png"
        alt="DeyMake"
        className={`w-30 h-12 md:w-55 md:h-14 object-contain ${className}`}
      />
    
  );
}