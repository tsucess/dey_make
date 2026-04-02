function Spinner({big}) {
  return (
    <div className="flex justify-center items-center">
      <div className={` border-4 border-gray-300 border-t-slate700 rounded-full animate-spin ${big ? 'w-12 h-12' : 'w-8 h-8'}`}></div>
    </div>
  );
}

export default Spinner;