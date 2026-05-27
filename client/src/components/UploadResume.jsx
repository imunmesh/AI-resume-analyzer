import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';
import { uploadResume } from '../services/api';
import toast from 'react-hot-toast';

export default function UploadResume({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only PDF and DOCX files are allowed (max 10MB)');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await uploadResume(file, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(pct);
      });

      toast.success('Resume uploaded successfully!');
      setFile(null);
      setProgress(0);
      onUploadComplete?.(data);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragReject
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
            : isDragActive
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10 scale-[1.02]'
            : file
            ? 'border-accent-emerald/50 bg-emerald-50/50 dark:bg-emerald-900/10'
            : 'border-dark-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-400 bg-dark-50/50 dark:bg-dark-800/30'
        }`}
      >
        <input {...getInputProps()} />

        {/* Background pattern */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-hero-pattern" />
        </div>

        <div className="relative z-10">
          {file ? (
            /* File selected */
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <HiOutlineDocumentText className="h-8 w-8 text-accent-emerald" />
              </div>
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={removeFile}
                className="text-dark-400 hover:text-red-500 transition-colors p-1"
                title="Remove file"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HiOutlineCloudUpload className="h-8 w-8 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-dark-900 dark:text-white text-lg">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                  or{' '}
                  <span className="text-primary-500 dark:text-primary-400 font-medium">
                    browse files
                  </span>{' '}
                  — PDF or DOCX, up to 10 MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-dark-500 dark:text-dark-400 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-dark-200 dark:bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      {file && !uploading && (
        <button onClick={handleUpload} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <HiOutlineCloudUpload className="h-5 w-5" />
          Upload & Analyze
        </button>
      )}
    </div>
  );
}
