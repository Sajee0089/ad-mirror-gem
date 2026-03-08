import { useState } from "react";
import { ImagePlus, X, Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MultiImageUploadProps {
  images: { file: File; preview: string }[];
  onChange: (images: { file: File; preview: string }[]) => void;
  mainIndex: number;
  onMainIndexChange: (index: number) => void;
}

const MultiImageUpload = ({ images, onChange, mainIndex, onMainIndexChange }: MultiImageUploadProps) => {
  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    const newImages = valid.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    onChange([...images, ...newImages]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (mainIndex === index) onMainIndexChange(0);
    else if (mainIndex > index) onMainIndexChange(mainIndex - 1);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <ImagePlus className="w-4 h-4" /> Images (up to 3, first is main)
      </Label>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative rounded-md overflow-hidden border-2 cursor-pointer transition-colors ${
              i === mainIndex ? "border-primary" : "border-border"
            }`}
            onClick={() => onMainIndexChange(i)}
          >
            <img src={img.preview} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover" />
            {i === mainIndex && (
              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="w-3 h-3" /> Main
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < 3 && (
          <label className="flex items-center justify-center aspect-square border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/50">
            <div className="text-center text-muted-foreground">
              <ImagePlus className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Add</span>
            </div>
            <Input type="file" accept="image/*" onChange={handleAdd} className="hidden" />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Click an image to set it as the main photo. {images.length}/3 added.
      </p>
    </div>
  );
};

export default MultiImageUpload;
