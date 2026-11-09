import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import logoMarkLight from "@/assets/logo-mark-light.png";
import logoMarkDark from "@/assets/logo-mark.png";

export const LogoMark = ({ className = "h-10 sm:h-12 w-auto", light = true }) => (
  <img
    src={light ? logoMarkLight : logoMarkDark}
    alt="Sacred Vista mark"
    className={`object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] ${className}`}
  />
);

export const Logo = ({
  light = true,
  className = "h-14 sm:h-16 lg:h-20 w-auto",
  showMarkOnly = false,
}) => {
  if (showMarkOnly) {
    return <LogoMark className={className} light={light} />;
  }

  return (
    <img
      src={light ? logoLight : logoDark}
      alt="Sacred Vista"
      className={`object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-[1.03] ${className}`}
    />
  );
};
