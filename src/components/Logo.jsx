export default function Logo({ className = "" }) {
  return (
    <>
    <img
        src="/DEYMAKE LOGO Yellow.svg"
        alt="DeyMake"
        className={`w-35 h-12 md:w-55 md:h-16 object-contain md:hidden ${className}`}/>
        <img
        src="/DEYMAKE LOGO with Tagline Yellow.svg"
        alt="DeyMake"
        className={`w-40 h-12 md:w-55 md:h-16 object-contain hidden md:block ${className}`}
      /></>
      
    
  );
}