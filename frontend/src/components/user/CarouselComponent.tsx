import { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlay: boolean;
  interval: number; // in milliseconds
  showArrows: boolean;
  showDots: boolean;
  height: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export const Carousel = ({
  images,
  autoPlay,
  interval,
  showArrows,
  showDots,
  height,
  objectFit,
}: CarouselProps) => {
  const { isSelected, isDark, responsiveStyles } = useResponsiveNode();
  const { connectors: { connect } } = useNode();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const validImages = images.filter(img => img.url.trim() !== '');

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      style={{
        height: `${height}px`,
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        ...responsiveStyles,
      }}
      className={`group ${isDark ? 'bg-slate-800' : 'bg-gray-100'} flex items-center justify-center transition-all ${
        isSelected ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-dashed outline-transparent'
      }`}
    >
      {validImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">No images added</p>
        </div>
      ) : (
        <>
          <div
            className="flex w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {validImages.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.alt}
                className="w-full h-full flex-shrink-0"
                style={{ objectFit }}
                draggable={false}
              />
            ))}
          </div>

          {/* Arrows */}
          {showArrows && validImages.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border-0"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {showDots && validImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goToSlide(e, i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all border-0 p-0 ${
                    i === currentIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CarouselSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CarouselProps,
  }));

  const addImage = () => {
    setProp((p: CarouselProps) => {
      p.images.push({
        id: Math.random().toString(36).substr(2, 9),
        url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80',
        alt: 'New image',
      });
    });
  };

  const removeImage = (index: number) => {
    setProp((p: CarouselProps) => {
      p.images.splice(index, 1);
    });
  };

  const updateImage = (index: number, key: 'url' | 'alt', value: string) => {
    setProp((p: CarouselProps) => {
      p.images[index][key] = value;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Images List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</h4>
          <button
            onClick={addImage}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {props.images.map((img, idx) => (
            <div key={img.id} className="p-2 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-2 relative group">
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-sm border border-gray-100 cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <label className="text-[10px] font-semibold text-gray-500">Image URL</label>
              <input
                type="text"
                value={img.url}
                onChange={(e) => updateImage(idx, 'url', e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                placeholder="https://..."
              />
              <label className="text-[10px] font-semibold text-gray-500 mt-1">Alt Text</label>
              <input
                type="text"
                value={img.alt}
                onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                placeholder="Description..."
              />
            </div>
          ))}
          {props.images.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-4">No images. Click Add above.</p>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* Dimensions & Sizing */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dimensions</h4>
        <label className="text-xs text-gray-600 block mb-2">
          Height (px)
          <input
            type="number"
            value={props.height}
            onChange={(e) => setProp((p: CarouselProps) => p.height = Number(e.target.value))}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm"
          />
        </label>
        <label className="text-xs text-gray-600 block">
          Image Fit
          <select
            value={props.objectFit}
            onChange={(e) => setProp((p: CarouselProps) => p.objectFit = e.target.value as CarouselProps['objectFit'])}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm"
          >
            <option value="fill">Fill (Stretch)</option>
            <option value="cover">Cover (Crop)</option>
            <option value="contain">Contain (Fit inside)</option>
          </select>
        </label>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* Behavior */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Behavior</h4>
        <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.autoPlay}
            onChange={(e) => setProp((p: CarouselProps) => p.autoPlay = e.target.checked)}
            className="rounded border-gray-300"
          />
          Auto-play slides
        </label>
        {props.autoPlay && (
          <label className="text-xs text-gray-600 block pl-5 mb-2">
            Interval (ms)
            <input
              type="number"
              step="500"
              value={props.interval}
              onChange={(e) => setProp((p: CarouselProps) => p.interval = Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm"
            />
          </label>
        )}
        <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.showArrows}
            onChange={(e) => setProp((p: CarouselProps) => p.showArrows = e.target.checked)}
            className="rounded border-gray-300"
          />
          Show Navigation Arrows
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={props.showDots}
            onChange={(e) => setProp((p: CarouselProps) => p.showDots = e.target.checked)}
            className="rounded border-gray-300"
          />
          Show Pagination Dots
        </label>
      </div>
    </div>
  );
};

export const defaultCarouselProps: CarouselProps = {
  images: [
    { id: '1', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80', alt: 'Slide 1' },
    { id: '2', url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&w=800&q=80', alt: 'Slide 2' },
  ],
  autoPlay: true,
  interval: 3000,
  showArrows: true,
  showDots: true,
  height: 400,
  objectFit: 'fill',
};

Carousel.craft = {
  displayName: 'Carousel',
  props: defaultCarouselProps,
  related: {
    settings: CarouselSettings,
  },
  rules: {
    canDrag: () => true, // Parent Container handles drag but setting it true avoids issues
  },
};
