import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { PlusCircle, X } from "react-feather";

// Define interfaces for type safety
interface ImageData {
  Code: number;
  SrNo: number;
  FileName: string;
  FileExt: string;
  Base64: string;
}

interface ImageUploadProps {
  name: string;
  modifyId?: number;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  error?: string;
}

const MultiImageUpload: React.FC<ImageUploadProps> = ({
  name,
  modifyId = 0,
  disabled,
  accept = "image/*",
  maxSize,
  error,
}) => {
  const { control, setValue, getValues, watch } = useFormContext();
  const [selectedImages, setSelectedImages] = useState<ImageData[]>(
    getValues(name) || []
  );
  const selectedImage = watch(name) || [];
  // Sync local state with form state
  useEffect(() => {
    const currentImages = getValues(name) || [];
    // console.log("currentImage", currentImages);
    setSelectedImages(currentImages);
  }, [getValues, name, selectedImage]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: ImageData[]) => void
  ) => {
    const files = Array.from(e.target.files || []);
    let counter = selectedImages.length + 1;

    const newImages: ImageData[] = [];
    files.forEach((file) => {
      if (maxSize && file.size > maxSize) {
        alert(
          `File ${file.name} exceeds the maximum size of ${
            maxSize / (1024 * 1024)
          }MB`
        );
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageData: ImageData = {
          Code: modifyId,
          SrNo: counter++,
          FileName: file.name,
          FileExt: file.name.split(".").pop() || "",
          Base64: reader.result as string,
        };
        newImages.push(imageData);
        const updatedImages = [...selectedImages, ...newImages];
        setSelectedImages(updatedImages);
        setValue(name, updatedImages, { shouldValidate: true });
        onChange(updatedImages);
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setValue(name, updatedImages, { shouldValidate: true });
  };

  return (
    <div className="add-choosen">
      <div className="input-blocks">
        <div className="image-upload">
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange } }) => (
              <>
                <div className="image-uploads">
                  <PlusCircle className="plus-down-add me-0" />
                  <span>Add Images</span>
                </div>
                <input
                  multiple
                  type="file"
                  accept={accept}
                  onChange={(e) => handleImageChange(e, onChange)}
                  disabled={disabled}
                />
              </>
            )}
          />
          {error && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {selectedImages.map((image, index) => (
        <div className="phone-img" key={`${image.SrNo}-${index}`}>
          <img src={image.Base64} alt={`image_${index}`} />
          <a>
            <X
              className="x-square-add remove-product"
              onClick={() => handleRemoveImage(index)}
            />
          </a>
        </div>
      ))}
    </div>
  );
};

export default MultiImageUpload;
