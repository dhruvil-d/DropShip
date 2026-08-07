import React, { useState } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Search } from 'lucide-react';
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
  Container,
  Text,
  Heading,
  Button,
  ImageComponent,
  InputComponent,
  TextareaComponent,
  SelectComponent,
  CardComponent,
  BadgeComponent,
  DividerComponent,
  LoginForm,
  HeroSection,
  ContactForm,
  AlertComponent,
  AvatarComponent,
  ListComponent,
  PricingCard,
  TestimonialCard,
  NewsletterSection,
  Table,
  TableRow,
  TableCell,
  Carousel,
};

// ------ Helpers to build default JSX elements for drag ------

function buildDefaultElement(name: string, propsOverride: Record<string, any> = {}): React.ReactElement | null {
  const def = componentRegistry[name];
  const Component = componentMap[name];
  if (!def || !Component) return null;

  // Extract default props from the registry
  const defaultProps: Record<string, unknown> = { ...propsOverride };
  for (const prop of def.props) {
    if (defaultProps[prop.name] === undefined) {
      defaultProps[prop.name] = prop.defaultValue;
    }
  }

  // For canvas components (containers), wrap in <Element> so children can be dropped inside
  if (def.isCanvas) {
    // Build default children for composite components
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

  // Wrap every leaf (non-canvas) component in its own Container
  // so each component has an independently-styleable box
  return (
    <Element is={Container} canvas padding={0} margin={0} gap={0}
      flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0}>
      <Element is={Component} {...defaultProps} />
    </Element>
  );
}

// ------ Category icon colors ------
const categoryColors: Record<string, string> = {
  Layout: 'text-purple-500',
  Basic: 'text-blue-500',
  Forms: 'text-green-500',
  'Data Display': 'text-amber-500',
  Composite: 'text-rose-500',
};

export const Toolbox = () => {
  const { connectors: { create } } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const categories = getComponentsByCategory();

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider mb-2">Components</h3>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map(({ category, components }) => (
          <div key={category} className="mb-1">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded"
            >
              <span className={categoryColors[category] || 'text-gray-500'}>{category}</span>
              <span className="text-gray-400 text-[10px]">
                {collapsedCategories.has(category) ? '▸' : '▾'}
              </span>
            </button>

            {/* Component cards */}
            {!collapsedCategories.has(category) && (
              <div className="flex flex-col gap-1 mt-1 mb-2">
                {components.map(comp => {
                  const Icon = comp.icon;
                  return (
                    <button
                      key={comp.name}
                      ref={ref => {
                        if (ref) {
                          const element = buildDefaultElement(comp.name);
                          if (element) {
                            create(ref, element);
                          }
                        }
                      }}
                      className="flex items-start gap-2.5 p-2 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="mt-0.5 p-1 rounded bg-gray-50 group-hover:bg-blue-100/50 transition-colors">
                        <Icon size={14} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-700 leading-tight">{comp.name.replace('Component', '')}</div>
                        <div className="text-[11px] text-gray-400 leading-snug mt-0.5 truncate">{comp.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            No components match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
