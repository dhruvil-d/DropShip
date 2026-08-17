import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Search, GripVertical, ChevronDown, ChevronRight, X } from 'lucide-react';
import { componentRegistry, getComponentsByCategory } from '../../shared/component-registry';

// ------ Component map: registry name → React component import ------
import { Container } from '../user/Container';
import { Text } from '../user/Text';
import { Heading } from '../user/Heading';
import { Button } from '../user/Button';
import { ImageComponent } from '../user/ImageComponent';
import { InputComponent } from '../user/InputComponent';
import { TextareaComponent } from '../user/TextareaComponent';
import { SelectComponent } from '../user/SelectComponent';
import { CardComponent } from '../user/CardComponent';
import { BadgeComponent } from '../user/BadgeComponent';
import { DividerComponent } from '../user/DividerComponent';
import { LoginForm } from '../user/LoginForm';
import { HeroSection } from '../user/HeroSection';
import { ContactForm } from '../user/ContactForm';
import { AlertComponent } from '../user/AlertComponent';
import { AvatarComponent } from '../user/AvatarComponent';
import { ListComponent } from '../user/ListComponent';
import { PricingCard } from '../user/PricingCard';
import { TestimonialCard } from '../user/TestimonialCard';
import { NewsletterSection } from '../user/NewsletterSection';
import { Table, TableRow, TableCell } from '../user/TableElements';
import { Carousel } from '../user/CarouselComponent';

const componentMap: Record<string, React.ComponentType<any>> = {
  Container, Text, Heading, Button, ImageComponent,
  InputComponent, TextareaComponent, SelectComponent,
  CardComponent, BadgeComponent, DividerComponent,
  LoginForm, HeroSection, ContactForm,
  AlertComponent, AvatarComponent, ListComponent,
  PricingCard, TestimonialCard, NewsletterSection,
  Table, TableRow, TableCell, Carousel,
};

// ------ Helpers to build default JSX elements for drag ------

function buildDefaultElement(name: string, propsOverride: Record<string, any> = {}): React.ReactElement | null {
  const def = componentRegistry[name];
  const Component = componentMap[name];
  if (!def || !Component) return null;

  const defaultProps: Record<string, unknown> = { ...propsOverride };
  for (const prop of def.props) {
    if (defaultProps[prop.name] === undefined) {
      defaultProps[prop.name] = prop.defaultValue;
    }
  }

  if (def.isCanvas) {
    if (def.defaultChildren && def.defaultChildren.length > 0) {
      const children = def.defaultChildren.map((child, i) => {
        const childElement = buildDefaultElement(child.component, child.props);
        if (!childElement) return null;
        return React.cloneElement(childElement, { key: i });
      }).filter(Boolean);
      return <Element is={Component} canvas {...defaultProps}>{children}</Element>;
    }
    return <Element is={Component} canvas {...defaultProps} />;
  }

  return (
    <Element is={Container} canvas padding={0} margin={0} gap={0}
      flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0}>
      <Element is={Component} {...defaultProps} />
    </Element>
  );
}

// ------ Category accent colors ------
const categoryAccents: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Layout:         { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', dot: 'bg-violet-500' },
  Basic:          { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  Forms:          { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Data Display': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
  Composite:      { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-500' },
};

const defaultAccent = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-500' };

export const Toolbox = () => {
  const { connectors: { create } } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [dragInfo, setDragInfo] = useState<{ name: string; icon: React.ComponentType<any>; x: number; y: number } | null>(null);

  const categories = getComponentsByCategory();

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Drag ghost tracking
  const handleDragStart = useCallback((name: string, icon: React.ComponentType<any>, e: React.DragEvent) => {
    // Hide the browser's default drag image with a transparent 1x1 pixel
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    setDragInfo({ name, icon, x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!dragInfo) return;

    const onDrag = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) return; // browser fires 0,0 at end
      setDragInfo(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    };
    const onDragEnd = () => setDragInfo(null);

    window.addEventListener('drag', onDrag);
    window.addEventListener('dragend', onDragEnd);
    return () => {
      window.removeEventListener('drag', onDrag);
      window.removeEventListener('dragend', onDragEnd);
    };
  }, [dragInfo]);

  // Filter components by search
  const filteredCategories = searchQuery.trim()
    ? categories.map(cat => ({
        ...cat,
        components: cat.components.filter(comp =>
          comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comp.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.components.length > 0)
    : categories;

  return (
    <>
      <div className="w-64 bg-[#fafbfc] border-r border-gray-200/80 h-full flex flex-col" style={{ minWidth: 256 }}>
        {/* Header */}
        <div className="p-3.5 border-b border-gray-200/60 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <GripVertical size={10} className="text-white" />
              </div>
              <h3 className="font-bold text-[11px] text-gray-600 uppercase tracking-[0.08em]">Components</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-medium tabular-nums">
              {filteredCategories.reduce((sum, c) => sum + c.components.length, 0)}
            </span>
          </div>
          <div className="relative group">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Component list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          {filteredCategories.map(({ category, components }) => {
            const accent = categoryAccents[category] || defaultAccent;
            const isCollapsed = collapsedCategories.has(category);

            return (
              <div key={category} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 group"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${accent.dot} transition-transform duration-300 ${isCollapsed ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-[0.06em] ${accent.text} flex-1 text-left`}>
                    {category}
                  </span>
                  <span className="text-[10px] text-gray-400 mr-1 tabular-nums">{components.length}</span>
                  <div className="text-gray-400 transition-transform duration-300">
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </div>
                </button>

                {/* Component cards */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-1 mt-0.5 mb-1">
                    {components.map(comp => {
                      const Icon = comp.icon;
                      return (
                        <button
                          key={comp.name}
                          ref={ref => {
                            if (ref) {
                              const element = buildDefaultElement(comp.name);
                              if (element) create(ref, element);
                            }
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(comp.name, Icon, e)}
                          className="flex items-center gap-2.5 px-2.5 py-2 border border-transparent rounded-lg
                            hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-[0_2px_8px_rgba(59,130,246,0.08)]
                            text-left transition-all duration-200
                            cursor-grab active:cursor-grabbing active:scale-[0.97] active:shadow-lg
                            group/item"
                        >
                          <div className={`p-1.5 rounded-md ${accent.bg} border ${accent.border} group-hover/item:border-blue-300 group-hover/item:bg-blue-100/60 transition-all duration-200`}>
                            <Icon size={13} className={`${accent.text} group-hover/item:text-blue-600 transition-colors duration-200`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-semibold text-gray-700 leading-tight group-hover/item:text-gray-900 transition-colors">
                              {comp.name.replace('Component', '')}
                            </div>
                            <div className="text-[10px] text-gray-400 leading-snug mt-0.5 truncate group-hover/item:text-gray-500 transition-colors">
                              {comp.description}
                            </div>
                          </div>
                          <GripVertical size={12} className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={16} className="text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-500">No results</div>
              <div className="text-xs text-gray-400 mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Floating Drag Ghost ===== */}
      {dragInfo && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragInfo.x + 12,
            top: dragInfo.y - 18,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-xl border border-blue-200 animate-[msgSlideIn_0.2s_ease-out]">
            <div className="p-1 rounded bg-blue-100 border border-blue-200">
              <dragInfo.icon size={12} className="text-blue-600" />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
              {dragInfo.name.replace('Component', '')}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
