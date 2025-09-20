import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import FormCheckbox from '../ui/FormCheckbox';
import FormInputWithIcon from '../ui/FormInputWithIcon';
import FormGroup from '../ui/FormGroup';
import Button from '../ui/Button';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy',
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      consent: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form submitted:', data);
    reset();
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-playfair font-bold text-charcoal mb-6">Contact Us</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormGroup>
            <FormInput
              id="name"
              type="text"
              label="Your Name"
              placeholder="John Doe"
              error={errors.name}
              fullWidth
              variant="filled"
              {...register('name')}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInputWithIcon
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email}
              fullWidth
              variant="filled"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
              {...register('email')}
            />
          </FormGroup>
        </div>
        
        <FormGroup>
          <FormInput
            id="phone"
            type="tel"
            label="Phone Number (Optional)"
            placeholder="+256754969593"
            error={errors.phone}
            fullWidth
            variant="filled"
            {...register('phone')}
          />
        </FormGroup>
        
        <FormGroup>
          <FormInput
            id="subject"
            type="text"
            label="Subject"
            placeholder="How can we help you?"
            error={errors.subject}
            fullWidth
            variant="filled"
            {...register('subject')}
          />
        </FormGroup>
        
        <FormGroup>
          <FormTextarea
            id="message"
            label="Your Message"
            placeholder="Please provide details about your inquiry..."
            rows={5}
            error={errors.message}
            fullWidth
            variant="filled"
            {...register('message')}
          />
        </FormGroup>
        
        <FormGroup>
          <FormCheckbox
            id="consent"
            label="I agree to the privacy policy and consent to being contacted regarding my inquiry."
            error={errors.consent}
            {...register('consent')}
          />
        </FormGroup>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : 'Send Message'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
