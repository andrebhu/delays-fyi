export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="text-sm">
        © {year} delays.fyi - Not affiliated with the MTA
        </p>
      </div>
    </footer>
  );
}
