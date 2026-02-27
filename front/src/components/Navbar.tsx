import { NavbarMobile } from './NavbarMobile';
import { NavbarPC } from './NavbarPC';

export const Navbar = () => {
  return (
    <>
      <NavbarMobile />
      <NavbarPC />
      {/* Padding pour éviter que le contenu se cache sous la navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
};
