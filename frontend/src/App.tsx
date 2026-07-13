import { Editor, Frame, Element } from '@craftjs/core';
import { Topbar } from './components/editor/Topbar';
import { Toolbox } from './components/editor/Toolbox';
import { SettingsPanel } from './components/editor/SettingsPanel';

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
};

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <Editor resolver={resolver}>
        <Topbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar — Component Explorer */}
          <Toolbox />
          
          {/* Main Canvas Area */}
          <div className="flex-1 p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-xl min-h-[800px] border border-gray-200">
              <Frame>
                <Element is={Container} padding={40} margin={0} gap={12} flexDirection="column" background="#ffffff" borderRadius={0} shadow="none" minHeight={50} canvas>
                  <Heading text="Welcome to DropShip" level="h1" fontSize={32} color="#111827" textAlign="left" />
                  <Text text="Drag components from the left sidebar to start building your application. Try composite components like LoginForm or HeroSection for pre-built layouts." fontSize={16} fontWeight="400" color="#6b7280" textAlign="left" lineHeight={1.6} />
                  <DividerComponent color="#e5e7eb" marginY={16} />
                  <Element is={Container} padding={20} margin={0} background="#f9fafb" borderRadius={8} gap={12} flexDirection="row" shadow="none" minHeight={50} canvas>
                    <Button text="Get Started" variant="primary" size="md" disabled={false} fullWidth={false} />
                    <Button text="Learn More" variant="outline" size="md" disabled={false} fullWidth={false} />
                    <BadgeComponent text="New" variant="success" />
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
