
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Dispute, DisputeComment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type DisputeCommentsProps = {
  dispute: Dispute;
};

const DisputeComments = ({ dispute }: DisputeCommentsProps) => {
  const { user } = useAuth();
  const { getDisputeComments, addDisputeComment } = useEscrow();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [comments, setComments] = useState<DisputeComment[]>([]);
  
  // Get comments from the context
  useEffect(() => {
    setComments(getDisputeComments(dispute.id));
  }, [dispute.id, getDisputeComments]);

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
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await addDisputeComment(dispute.id, comment, files);
      if (success) {
        setComment("");
        // Clean up all preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setFiles([]);
        
        // The comments will be updated via the context
        setComments(getDisputeComments(dispute.id));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "seller":
        return "secondary";
      case "buyer":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment on this dispute.
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${comment.userName}`} />
                  <AvatarFallback>{comment?.userName?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.userName}</span>
                    <Badge variant={getRoleBadgeVariant(comment.userRole)}>
                      {comment.userRole}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), "PPp")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  
                  {comment.attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {comment.attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="border rounded overflow-hidden bg-gray-50 h-20"
                        >
                          <img
                            src={attachment}
                            alt={`Attachment ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {user && dispute.status === "pending" && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="comment">Add a comment</Label>
              <Textarea
                id="comment"
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="attachments" className="cursor-pointer flex flex-col items-center">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="h-20 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                        {url.startsWith("blob:") && (
                          files[index].type.startsWith("image/") ? (
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
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
              disabled={isSubmitting || !comment.trim()} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeComments;
