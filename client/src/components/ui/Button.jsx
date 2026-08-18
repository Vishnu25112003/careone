import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-[linear-gradient(90deg,#1B74B7,#3FA0D8)] text-white shadow-[0_8px_18px_rgba(27,116,183,0.28)] hover:-translate-y-0.5",
  outline:
    "bg-white text-navy border-[1.5px] border-[#D7E4EA] hover:border-teal hover:text-teal",
};

const sizes = {
  md: "px-[30px] py-3 text-sm",
  lg: "px-8 py-[13px] text-[14.5px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  className = "",
  children,
  ...rest
}) {
  const cls = `inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
