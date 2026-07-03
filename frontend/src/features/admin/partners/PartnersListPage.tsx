import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { usePartners, useDeletePartner } from '../../../lib/hooks/usePartners';
import CloudflareImage from '../../../components/ui/CloudflareImage';
import { PARTNER_CATEGORIES } from './PartnerForm';

const PartnersListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: partners = [], isLoading, error } = usePartners(selectedCategory || undefined);
  const deletePartnerMutation = useDeletePartner();

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await deletePartnerMutation.mutateAsync(id);
        toast.success('Partner deleted successfully');
      } catch (err) {
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/packages?partner=${code}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success('Referral link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy link');
      });
  };

  const getCategoryLabel = (value: string) => {
    return PARTNER_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  // Filter partners locally if search query is entered
  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-charcoal">Partners & Affiliations</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage partners and affiliations displayed on the website.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/admin/partners/new">
            <Button variant="primary" size="md">
              Add Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search partners by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal focus:border-teal sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal focus:border-teal sm:text-sm"
          >
            <option value="">All Categories</option>
            {PARTNER_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners List Table */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-md border border-gray-100 md:rounded-lg bg-white">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse text-charcoal">Loading partners...</div>
                </div>
              ) : error ? (
                <div className="p-8 text-center bg-red-50 text-red-700">
                  Failed to fetch partners. Please try again.
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No partners found matching the criteria.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-charcoal sm:pl-6">
                        Logo
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Promo Code
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Client Discount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Partner Commission
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Website
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-charcoal">
                        Order Index
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          {partner.logo_image_id ? (
                            <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              <CloudflareImage
                                imageId={partner.logo_image_id}
                                variant="thumbnail"
                                alt={partner.name}
                                className="object-contain max-w-full max-h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-semibold text-xs">
                              No Logo
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {partner.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getCategoryLabel(partner.category)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="font-mono text-teal bg-teal/10 px-2 py-1 rounded text-xs font-bold">
                            {partner.partner_code}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {partner.discount_percent}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {partner.commission_percent}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {partner.website_url ? (
                            <a
                              href={partner.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal hover:underline"
                            >
                              Visit Site &rarr;
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                          {partner.order_index}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              partner.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {partner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(partner.partner_code)}
                            >
                              Copy Link
                            </Button>
                            <Link to={`/admin/partners/${partner.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(partner.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersListPage;
