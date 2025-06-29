import React, { useState, useEffect, useRef } from "react";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  className?: string;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  minWidth = 320,
  minHeight = 240,
  aspectRatio,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        const width = Math.max(offsetWidth, minWidth);
        const height = aspectRatio
          ? width / aspectRatio
          : Math.max(offsetWidth * 0.6, minHeight);

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [minWidth, minHeight, aspectRatio]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height: dimensions.height }}
    >
      {React.cloneElement(children as React.ReactElement, {
        width: dimensions.width,
        height: dimensions.height,
      })}
    </div>
  );
};

export default ResponsiveWrapper;
