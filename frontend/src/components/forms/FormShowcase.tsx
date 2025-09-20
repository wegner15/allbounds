import React from 'react';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import FormCheckbox from '../ui/FormCheckbox';
import FormInputWithIcon from '../ui/FormInputWithIcon';
import FormGroup from '../ui/FormGroup';
import FormLabel from '../ui/FormLabel';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';

const FormShowcase: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-playfair font-bold text-charcoal mb-8">Form Elements Showcase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Text Inputs</h2>
          
          <div className="space-y-6">
            <FormGroup>
              <FormLabel htmlFor="default-input">Default Input</FormLabel>
              <FormInput
                id="default-input"
                placeholder="Default input style"
                variant="default"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="filled-input" required>Filled Input</FormLabel>
              <FormInput
                id="filled-input"
                placeholder="Filled input style"
                variant="filled"
                helperText="This is a filled style input with helper text"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="outlined-input">Outlined Input</FormLabel>
              <FormInput
                id="outlined-input"
                placeholder="Outlined input style"
                variant="outlined"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="error-input">Input with Error</FormLabel>
              <FormInput
                id="error-input"
                placeholder="Input with error"
                variant="filled"
                error={{ message: 'This field has an error', type: 'validate' }}
              />
            </FormGroup>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Icon Inputs & Search</h2>
          
          <div className="space-y-6">
            <FormGroup>
              <FormLabel htmlFor="icon-left-input">Input with Left Icon</FormLabel>
              <FormInputWithIcon
                id="icon-left-input"
                placeholder="Input with left icon"
                variant="filled"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
                iconPosition="left"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="icon-right-input">Input with Right Icon</FormLabel>
              <FormInputWithIcon
                id="icon-right-input"
                placeholder="Input with right icon"
                variant="filled"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                }
                iconPosition="right"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Search Input (Small)</FormLabel>
              <SearchInput 
                placeholder="Search destinations..." 
                size="sm"
                variant="filled"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Search Input (Large)</FormLabel>
              <SearchInput 
                placeholder="Search packages..." 
                size="lg"
                variant="outlined"
              />
            </FormGroup>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Textarea & Checkbox</h2>
          
          <div className="space-y-6">
            <FormGroup>
              <FormLabel htmlFor="default-textarea">Default Textarea</FormLabel>
              <FormTextarea
                id="default-textarea"
                placeholder="Write your message here..."
                rows={4}
                variant="default"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="filled-textarea">Filled Textarea</FormLabel>
              <FormTextarea
                id="filled-textarea"
                placeholder="Write your message here..."
                rows={4}
                variant="filled"
              />
            </FormGroup>
            
            <FormGroup>
              <FormCheckbox
                id="checkbox-1"
                label="I agree to the terms and conditions"
              />
            </FormGroup>
            
            <FormGroup>
              <FormCheckbox
                id="checkbox-2"
                label="Subscribe to newsletter"
                error={{ message: 'This field is required', type: 'validate' }}
              />
            </FormGroup>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Buttons</h2>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="primary" size="md" disabled>Disabled</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="md" fullWidth>Full Width Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="md">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  With Icon
                </span>
              </Button>
              
              <Button variant="secondary" size="md">
                <span className="flex items-center">
                  Submit
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormShowcase;
