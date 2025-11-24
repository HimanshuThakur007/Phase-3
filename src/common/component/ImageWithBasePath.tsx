import React, { memo } from "react";
import { base_path } from "../../environment";

interface ImageWithBasePathProps {
  className?: string;
  src: string;
  alt?: string;
  height?: number | string;
  width?: number | string;
  id?: string;
}

const ImageWithBasePath: React.FC<ImageWithBasePathProps> = ({
  className,
  src,
  alt,
  height,
  width,
  id,
}) => {
  const isAbsoluteURL = (url: string) => /^https?:\/\//i.test(url);
  const fullSrc = isAbsoluteURL(src) ? src : `${base_path}${src}`;
  return (
    <img
      className={className}
      src={fullSrc}
      alt={alt}
      height={height}
      width={width}
      id={id}
    />
  );
};

export default memo(ImageWithBasePath);
