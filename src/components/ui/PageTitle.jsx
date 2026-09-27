export default function PageTitle({
  icon,
  children,
  className = "",
  titleClassName = "text-2xl sm:text-3xl font-bold text-primary",
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={icon}
        alt=""
        className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
      />
      <h1 className={titleClassName}>{children}</h1>
    </div>
  );
}
