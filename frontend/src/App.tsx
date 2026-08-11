import { Editor, Frame, Element } from '@craftjs/core';
import { Topbar } from './components/editor/Topbar';
import { Toolbox } from './components/editor/Toolbox';
import { SettingsPanel } from './components/editor/SettingsPanel';
import { useResponsiveStore } from './shared/responsiveStore';
import { useDarkModeStore } from './shared/darkModeStore';

// ------ User components ------
import { Container } from './components/user/Container';
import { Button } from './components/user/Button';
import { Text } from './components/user/Text';
import { Heading } from './components/user/Heading';
import { ImageComponent } from './components/user/ImageComponent';
import { InputComponent } from './components/user/InputComponent';
import { TextareaComponent } from './components/user/TextareaComponent';
import { SelectComponent } from './components/user/SelectComponent';
import { CardComponent } from './components/user/CardComponent';
import { BadgeComponent } from './components/user/BadgeComponent';
import { DividerComponent } from './components/user/DividerComponent';
import { LoginForm } from './components/user/LoginForm';
import { HeroSection } from './components/user/HeroSection';
import { ContactForm } from './components/user/ContactForm';
import { AlertComponent } from './components/user/AlertComponent';
import { AvatarComponent } from './components/user/AvatarComponent';
import { ListComponent } from './components/user/ListComponent';
import { PricingCard } from './components/user/PricingCard';
import { TestimonialCard } from './components/user/TestimonialCard';
import { NewsletterSection } from './components/user/NewsletterSection';
import { Table, TableRow, TableCell } from './components/user/TableElements';
import { Carousel } from './components/user/CarouselComponent';

// Dynamic resolver — maps component displayName to the actual React component.
// When you add a new component, add it here AND in the component-registry.
const resolver = {
  Container,
  Button,
  Text,
  Heading,
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

function App() {
  const activeBreakpoint = useResponsiveStore((s) => s.activeBreakpoint);
  const breakpoints = useResponsiveStore((s) => s.breakpoints);
  const activeWidth = breakpoints[activeBreakpoint].width;
  const globalDarkMode = useDarkModeStore((s) => s.globalDarkMode);

  // Determine canvas frame class based on breakpoint
  const frameClass =
    activeBreakpoint === 'mobile'
      ? 'mobile-frame'
      : activeBreakpoint === 'tablet'
        ? 'tablet-frame'
        : '';

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <Editor resolver={resolver}>
        <Topbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar — Component Explorer */}
          <Toolbox />
          
          {/* Main Canvas Area */}
          <div className={`flex-1 overflow-y-auto flex justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeBreakpoint === 'desktop' ? (globalDarkMode ? 'bg-gray-900' : 'bg-white') + ' p-0' : (globalDarkMode ? 'bg-gray-800' : 'bg-gray-100') + ' p-8'}`}>
            <div
              className={`w-full responsive-canvas ${frameClass} transition-colors duration-500 ${
                globalDarkMode ? 'bg-gray-900' : 'bg-white'
              } ${
                activeBreakpoint === 'desktop' 
                  ? 'min-h-full shadow-none border-none' 
                  : `shadow-xl min-h-[800px] border ${globalDarkMode ? 'border-gray-700' : 'border-gray-200'}`
              }`}
              style={{
                maxWidth: activeBreakpoint === 'desktop' ? '100%' : `${activeWidth}px`,
                willChange: 'max-width',
                transition: 'max-width 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Frame>
                <Element is={Container} padding={40} margin={0} gap={12} flexDirection="column" background="#ffffff" borderRadius={0} shadow="none" minHeight="100vh" canvas>
                  <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                    <Heading text="Welcome to DropShip" level="h1" fontSize={32} color="#111827" textAlign="left" />
                  </Element>
                  <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                    <Text text="Drag components from the left sidebar to start building your application. Try composite components like LoginForm or HeroSection for pre-built layouts." fontSize={16} fontWeight="400" color="#6b7280" textAlign="left" lineHeight={1.6} />
                  </Element>
                  <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                    <DividerComponent color="#e5e7eb" marginY={16} />
                  </Element>
                  <Element is={Container} padding={20} margin={0} background="#f9fafb" borderRadius={8} gap={12} flexDirection="row" shadow="none" minHeight={50} canvas>
                    <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                      <Button variant="primary" size="md" disabled={false} fullWidth={false} />
                    </Element>
                    <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                      <Button variant="outline" size="md" disabled={false} fullWidth={false} />
                    </Element>
                    <Element is={Container} padding={0} margin={0} gap={0} flexDirection="column" background="transparent" borderRadius={0} shadow="none" minHeight={0} canvas>
                      <BadgeComponent variant="success" />
                    </Element>
                  </Element>
                </Element>
              </Frame>
            </div>
          </div>
          
          {/* Right Sidebar — Properties */}
          <SettingsPanel />
        </div>
      </Editor>
    </div>
  );
}

export default App;
