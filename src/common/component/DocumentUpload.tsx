import React, { useEffect, useState } from "react";
import { Controller, FieldError, UseFormReturn } from "react-hook-form";

interface DocumentUploadProps {
  name: string;
  label: string;
  form: UseFormReturn<any>;
  accept?: string;
  maxSize?: number; // in bytes
  required?: boolean;
  disabled?: boolean;
  validation?: Record<string, any>;
}

interface FileData {
  base64: string;
  fileExtension: string;
  name: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  name,
  label,
  form,
  accept = ".pdf,.doc,.docx,.xlsx,.xls,image/*",
  maxSize = 5 * 1024 * 1024,
  required = false,
  disabled = false,
  validation = {},
}) => {
  const {
    control,
    formState: { errors },
    clearErrors,
    watch,
  } = form;
  const error = errors[name] as FieldError | undefined;
  const fileData = watch(name) as FileData | null;
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  // Determine file type and set preview
  useEffect(() => {
    if (fileData && fileData.base64) {
      const ext = fileData.fileExtension?.toLowerCase();
      const fileName = fileData.name || `file.${ext || "unknown"}`;
      const previewFile = fileData.base64 || "";
      // console.log("base64", previewFile);
      setFileName(fileName);
      setPreview(previewFile);
      // Determine file type for preview
      if (
        ext === "png" ||
        ext === "jpeg" ||
        ext === "jpg" ||
        ext === "gif" ||
        fileData.base64.startsWith("data:image/")
      ) {
        setFileType("image");
        setPreview(fileData.base64);
      } else if (
        ext === "pdf" ||
        fileData.base64.startsWith("data:application/pdf")
      ) {
        setFileType("pdf");
        setPreview(fileData.base64);
        console.log("pdf", fileData.base64);
      } else if (["doc", "docx", "xlsx", "xls", "csv"].includes(ext || "")) {
        setFileType(ext || "document");
        setPreview(fileData.base64);
      } else {
        setFileType(null);
        setPreview(null);
      }
    } else {
      setFileName(null);
      setPreview(null);
      setFileType(null);
    }
  }, [fileData]);

  // Convert file to Base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Get file extension
  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  // Handle file change
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FileData | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      setPreview(null);
      setFileType(null);
      onChange(null);
      clearErrors(name);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      form.setError(name, {
        type: "manual",
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
      });
      return;
    }

    try {
      const base64 = await toBase64(file);
      const fileExtension = getFileExtension(file.name);
      const fileData: FileData = {
        base64,
        fileExtension,
        name: file.name,
      };

      onChange(fileData);
      clearErrors(name);
    } catch (error) {
      form.setError(name, {
        type: "manual",
        message: "Failed to process file",
      });
    }
  };

  // Clear selected file
  const handleClear = (onChange: (value: null) => void) => {
    setFileName(null);
    setPreview(null);
    setFileType(null);
    onChange(null);
    clearErrors(name);
  };

  // Construct validation rules
  const validationRules = {
    required: required ? `${label} is required` : false,
    ...validation,
    validate: {
      fileSize: (value: FileData | null) =>
        !value ||
        value.base64.length < maxSize / 1.33 ||
        `File size must be less than ${maxSize / (1024 * 1024)}MB`,
      ...validation.validate,
    },
  };

  return (
    <div className="mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={validationRules}
        render={({ field: { onChange, value } }) => (
          <div>
            <input
              type="file"
              className={`form-control ${error ? "is-invalid" : ""}`}
              accept={accept}
              disabled={disabled}
              onChange={(e) => handleFileChange(e, onChange)}
            />
            {value && fileName && (
              <div className="mt-2">
                {fileType === "image" && preview ? (
                  <div>
                    <img
                      src={preview}
                      alt={fileName}
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  </div>
                ) : fileType === "pdf" && preview ? (
                  <div>
                    <iframe
                      src={preview}
                      title={fileName}
                      style={{
                        width: "200px",
                        height: "200px",
                        border: "none",
                      }}
                    />
                  </div>
                ) : (fileType === "doc" ||
                    fileType === "docx" ||
                    fileType === "xlsx" ||
                    fileType === "csv" ||
                    fileType === "xls") &&
                  preview ? (
                  <div>
                    <p>
                      File: {fileName} (
                      <a
                        href={preview}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                      )
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>Selected file: {fileName}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-1"
                  onClick={() => handleClear(onChange)}
                  disabled={disabled}
                >
                  Clear
                </button>
              </div>
            )}
            {error && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {error.message}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default DocumentUpload;
