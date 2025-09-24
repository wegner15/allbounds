import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api';

interface Exclusion {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  is_active: boolean;
}

const ExclusionsListPage: React.FC = () => {
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExclusions = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<Exclusion[]>('/exclusions/');
        setExclusions(response as Exclusion[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch exclusions');
        setLoading(false);
        toast.error('Failed to fetch exclusions');
      }
    };

    fetchExclusions();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exclusion?')) {
      try {
        await apiClient.delete(`/exclusions/${id}`);
        setExclusions(exclusions.filter(exclusion => exclusion.id !== id));
        toast.success('Exclusion deleted successfully');
      } catch (err) {
        toast.error('Failed to delete exclusion');
      }
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Exclusions</h1>
            <p className="mt-2 text-sm text-gray-600">
              A list of all exclusions that can be assigned to packages and group trips.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link to="/admin/exclusions/new">
              <Button variant="primary" size="md">
                Add Exclusion
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow-md border border-gray-100 md:rounded-lg">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse text-charcoal">Loading...</div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-charcoal sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Icon
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {exclusions.map((exclusion) => (
                        <tr key={exclusion.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {exclusion.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {exclusion.description?.length > 50
                              ? `${exclusion.description.substring(0, 50)}...`
                              : exclusion.description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {exclusion.category}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {exclusion.icon && (
                              <span className="inline-flex items-center">
                                <i className={`fas fa-${exclusion.icon} mr-2`}></i>
                                {exclusion.icon}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                exclusion.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {exclusion.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/admin/exclusions/${exclusion.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(exclusion.id)}
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
    </>
  );
};

export default ExclusionsListPage;
