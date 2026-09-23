import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, MapPin, Globe, CreditCard, FileText } from 'lucide-react';
import { clientsApi } from '../../../../lib/api/clients';
import type { Client } from '../../../../lib/types/finance';

interface ClientEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  clientToEdit?: Client | null;
}

export const ClientEditorModal: React.FC<ClientEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  clientToEdit
}) => {
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [dietary, setDietary] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setClientType(clientToEdit.client_type);
      setFirstName(clientToEdit.first_name || '');
      setLastName(clientToEdit.last_name || '');
      setCompanyName(clientToEdit.company_name || '');
      setContactPerson(clientToEdit.contact_person || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setAltPhone(clientToEdit.alt_phone || '');
      setCountry(clientToEdit.country_of_origin || 'Uganda');
      setCity(clientToEdit.city || '');
      setAddress(clientToEdit.address || '');
      setTinNumber(clientToEdit.tin_number || '');
      setPassportNumber(clientToEdit.passport_number || '');
      setNationality(clientToEdit.nationality || '');
      setDietary(clientToEdit.dietary_requirements || '');
      setSpecialNotes(clientToEdit.special_notes || '');
    } else {
      setClientType('individual');
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAltPhone('');
      setCountry('Uganda');
      setCity('');
      setAddress('');
      setTinNumber('');
      setPassportNumber('');
      setNationality('');
      setDietary('');
      setSpecialNotes('');
    }
    setError(null);
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: Partial<Client> = {
        client_type: clientType,
        first_name: clientType === 'individual' ? firstName : undefined,
        last_name: clientType === 'individual' ? lastName : undefined,
        company_name: clientType === 'corporate' ? companyName : undefined,
        contact_person: clientType === 'corporate' ? contactPerson : undefined,
        email,
        phone,
        alt_phone: altPhone,
        country_of_origin: country,
        city,
        address,
        tin_number: tinNumber,
        passport_number: passportNumber,
        nationality,
        dietary_requirements: dietary,
        special_notes: specialNotes,
      };

      let res: Client;
      if (clientToEdit) {
        res = await clientsApi.updateClient(clientToEdit.id, payload);
      } else {
        res = await clientsApi.createClient(payload);
      }

      onSaved(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save client profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-teal-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-playfair">
              {clientToEdit ? 'Edit Client Profile' : 'Add New Client'}
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Enter individual traveler or corporate client details for invoicing and tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Client Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Client Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClientType('individual')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  clientType === 'individual'
                    ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4 text-teal-600" />
                Individual Traveler
              </button>
              <button
                type="button"
                onClick={() => setClientType('corporate')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  clientType === 'corporate'
                    ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building className="w-4 h-4 text-teal-600" />
                Corporate / Organization
              </button>
            </div>
          </div>

          {/* Name Fields */}
          {clientType === 'individual' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Smith"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Safari Expeditions Ltd"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 700 000000"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location & Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Uganda"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City / Town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kampala"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {clientType === 'corporate' ? 'TIN / VAT Number' : 'Passport / ID Number'}
              </label>
              <input
                type="text"
                value={clientType === 'corporate' ? tinNumber : passportNumber}
                onChange={(e) =>
                  clientType === 'corporate' ? setTinNumber(e.target.value) : setPassportNumber(e.target.value)
                }
                placeholder={clientType === 'corporate' ? 'e.g. 1000293847' : 'e.g. A1234567'}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot 14, Acacia Avenue, Kololo"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Dietary / Special Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dietary Preferences</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Vegetarian, Gluten-Free, Halal"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="VIP traveler, anniversary trip, etc."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? 'Saving...' : clientToEdit ? 'Update Profile' : 'Save Client'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
