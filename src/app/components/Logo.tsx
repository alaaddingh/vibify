import { IoMusicalNotes } from "react-icons/io5";

interface LogoProps {
  primary?: string; 
  secondary?: string; 
  size?: number;
  margintop?: number;
}

export default function Logo({ primary, secondary, size, margintop }: LogoProps) {
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: primary, 
        scale: size,
        marginTop: margintop
    }}
    >
      <IoMusicalNotes
        className="text-3xl"
        style={{color: secondary}}
      />
    </div>
  );
}
