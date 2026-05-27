import { HiOutlineDownload, HiOutlinePrinter } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ExportButton() {
  const handleExport = () => {
    toast.success('Preparing PDF export...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <button
      onClick={handleExport}
      className="btn-secondary inline-flex items-center gap-2 text-sm no-print"
    >
      <HiOutlineDownload className="h-4 w-4" />
      Export as PDF
    </button>
  );
}
