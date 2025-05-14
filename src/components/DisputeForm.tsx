
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEscrow } from "@/contexts/EscrowContext";
import { Loader2 } from "lucide-react";

type DisputeFormProps = {
  escrowId: string;
  onSuccess: () => void;
};

const DisputeForm = ({ escrowId, onSuccess }: DisputeFormProps) => {
  const { createDispute } = useEscrow();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);

    // Create preview URLs for the uploaded files
    const newFileUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newFileUrls]);
  };

  const removeFile = (index: number) => {
    // Clean up the preview URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createDispute(escrowId, reason, files);
      if (success) {
        // Clean up all preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for dispute</Label>
        <Textarea
          id="reason"
          placeholder="Explain why you're disputing this transaction..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidence">Supporting Evidence</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
          <input
            type="file"
            id="evidence"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <Label htmlFor="evidence" className="cursor-pointer flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm text-gray-600 font-medium">
              Click to upload files or images
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, PDF, DOC
            </span>
          </Label>
        </div>
      </div>

      {/* Preview uploaded files */}
      {previewUrls.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Files</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="h-24 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                  {url.startsWith("blob:") && (
                    files[index].type.startsWith("image/") ? (
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                    ) : (
                    <div className="text-sm text-gray-500 truncate max-w-full px-2">
                      {files[index]?.name || `File ${index + 1}`}
                    </div>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !reason.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Dispute"
        )}
      </Button>
    </form>
  );
};

export default DisputeForm;
