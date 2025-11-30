import React from 'react';
import { useParams } from 'react-router-dom';
import { useComprehensivePackageBySlug } from '../lib/hooks/usePackages';

const DebugPackagePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useComprehensivePackageBySlug(slug || 'ultimate-highland-to-savannah-safari');

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;
  if (!data) return <div className="p-8">No data</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Package Debug Info</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Slug:</strong> {data.slug}</p>
        <p><strong>Is Featured:</strong> {data.is_featured ? 'Yes' : 'No'}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Inclusions ({data.inclusion_items?.length || 0})</h2>
        {data.inclusion_items && data.inclusion_items.length > 0 ? (
          <ul className="space-y-2">
            {data.inclusion_items.map((item) => (
              <li key={item.id} className="border-b pb-2">
                <strong>{item.name}</strong>
                {item.icon && <span className="ml-2 text-sm text-gray-500">(Icon: {item.icon})</span>}
                {item.category && <span className="ml-2 text-sm text-blue-600">[{item.category}]</span>}
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">No inclusions found!</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Exclusions ({data.exclusion_items?.length || 0})</h2>
        {data.exclusion_items && data.exclusion_items.length > 0 ? (
          <ul className="space-y-2">
            {data.exclusion_items.map((item) => (
              <li key={item.id} className="border-b pb-2">
                <strong>{item.name}</strong>
                {item.icon && <span className="ml-2 text-sm text-gray-500">(Icon: {item.icon})</span>}
                {item.category && <span className="ml-2 text-sm text-blue-600">[{item.category}]</span>}
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">No exclusions found!</p>
        )}
      </div>

      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Raw JSON Data</h2>
        <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPackagePage;
