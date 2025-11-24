import { Controller, useFormContext } from "react-hook-form";
import { PlusCircle, XCircle } from "react-feather";

const ImageUpload = ({
  name,
  label,
  required,
  accept,
  maxSize,
  error,
}: any & { error?: string }) => {
  const context = useFormContext();

  // Check if form context is available
  if (!context) {
    console.error(
      "InputImage must be used within a FormProvider. Ensure the parent component wraps the form with FormProvider."
    );
    return <div>Error: Form context not found</div>;
  }

  const { control } = context;

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field }) => (
        <div className="profile-pic-upload">
          <div className="profile-pic" style={{ position: "relative" }}>
            {field.value ? (
              <>
                <img
                  src={field.value}
                  alt="Profile"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => field.onChange(null)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  title="Remove image"
                >
                  <XCircle color="red" size={24} />
                </button>
              </>
            ) : (
              <span>
                <PlusCircle className="plus-down-add" />
                {label}
              </span>
            )}
          </div>
          <div className="input-blocks mb-0">
            <div className="image-upload mb-0">
              <input
                type="file"
                accept={accept || "image/*"}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (maxSize && file.size > maxSize) {
                      alert(`File size exceeds ${maxSize / (1024 * 1024)}MB`);
                      field.onChange(null);
                      return;
                    }
                    try {
                      const base64 = await convertToBase64(file);
                      field.onChange(base64);
                    } catch (err) {
                      alert("Failed to read file");
                      field.onChange(null);
                    }
                  } else {
                    field.onChange(null);
                  }
                }}
              />
              <div className="image-uploads">
                <h4>Change Image</h4>
              </div>
            </div>
          </div>
          {error && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </div>
      )}
    />
  );
};

export default ImageUpload;
