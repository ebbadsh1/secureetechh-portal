import logoAsset from "@/assets/securetech-logo.png.asset.json";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`flex items-center ${light ? "rounded-md bg-white px-2 py-1.5" : ""}`}
    >
      <img
        src={logoAsset.url}
        alt="Secure Tech Consultancy (Pvt) Ltd"
        className="h-10 w-auto object-contain"
        width={180}
        height={40}
      />
    </span>
  );
}
