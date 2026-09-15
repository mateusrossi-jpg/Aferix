import React from 'react';
import * as reactWindow from 'react-window';

const ListComponent = 
  (reactWindow as any).FixedSizeList || 
  (reactWindow as any).default?.FixedSizeList || 
  (reactWindow as any).default;

export interface VirtualListProps {
  height: number;
  itemCount: number;
  itemSize: number;
  width: string | number;
  itemData?: any;
  className?: string;
  children: React.ComponentType<{ index: number; style: React.CSSProperties; data: any }>;
}

export const VirtualList: React.FC<VirtualListProps> = ({
  height,
  itemCount,
  itemSize,
  width,
  itemData,
  className,
  children: RowComponent,
}) => {
  if (!ListComponent) {
    return (
      <div className={`overflow-y-auto pr-2 space-y-2 ${className || ''}`} style={{ maxHeight: height }}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} style={{ height: itemSize - 5 }}>
            <RowComponent index={index} style={{ position: 'relative', width: '100%', height: itemSize - 5 }} data={itemData} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ListComponent
      height={height}
      itemCount={itemCount}
      itemSize={itemSize}
      width={width}
      itemData={itemData}
      className={className}
    >
      {RowComponent}
    </ListComponent>
  );
};
