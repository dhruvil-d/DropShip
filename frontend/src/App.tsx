import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Topbar } from './components/editor/Topbar';
import { Toolbox } from './components/editor/Toolbox';
import { SettingsPanel } from './components/editor/SettingsPanel';
import { Container } from './components/user/Container';
import { Button } from './components/user/Button';
import { Text } from './components/user/Text';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <Editor resolver={{ Container, Button, Text }}>
        <Topbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Palette */}
          <Toolbox />
          
          {/* Main Canvas Area */}
          <div className="flex-1 p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-xl min-h-[800px] border border-gray-200">
              <Frame>
                <Element is={Container} padding={40} background="#ffffff" canvas>
                  <Text text="Welcome to the Visual Builder" fontSize={28} />
                  <Text text="Drag components from the left sidebar to start building your application." fontSize={16} />
                  <Container padding={20} background="#f3f4f6">
                    <Button text="Get Started" variant="primary" />
                  </Container>
                </Element>
              </Frame>
            </div>
          </div>
          
          {/* Right Sidebar - Properties */}
          <SettingsPanel />
        </div>
      </Editor>
    </div>
  );
}

export default App;
