import React, { useState } from 'react';
import { X, Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultEmail?: string;
  defaultName?: string;
  onSend: (data: {
    recipient_email: string;
    recipient_name?: string;
    subject?: string;
    message?: string;
  }) => Promise<void>;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  title,
  defaultEmail = '',
  defaultName = '',
  onSend
}) => {
  const [email, setEmail] = useState<string>(defaultEmail);
  const [name, setName] = useState<string>(defaultName);
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Recipient email is required.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await onSend({
        recipient_email: email.trim(),
        recipient_name: name.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to dispatch email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-teal-300" />
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-200 hover:text-white rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-gray-900 text-lg">Email Dispatched!</h4>
            <p className="text-xs text-gray-500">Document sent successfully to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Custom Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Leave blank for standard subject"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personalized note to the recipient..."
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50 flex items-center"
              >
                {sending ? 'Sending...' : <><Send className="w-3.5 h-3.5 mr-1" /> Send Now</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
