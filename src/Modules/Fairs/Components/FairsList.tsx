import { useFairs, useUpdateFairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';
import { useState } from 'react';

const FairsList = () => {
  const { data: fairs, isLoading } = useFairs();
  const updateStatus = useUpdateFairStatus();

  if (isLoading) return <p>Loading...</p>;

  const toggleStatus = async (fair: any) => {
    await updateStatus.mutateAsync({ id_fair: fair.id_fair, status: !fair.status });
  };

  return (
    <div className="space-y-4">
      {fairs?.map(fair => (
        <div key={fair.id_fair} className="border p-4 rounded bg-white shadow">
          <h3 className="text-xl font-bold">{fair.name}</h3>
          <p>{fair.description}</p>
          <p><strong>Location:</strong> {fair.location}</p>
          <p><strong>Capacity:</strong> {fair.stand_capacity}</p>
          <p><strong>Status:</strong> {fair.status ? 'Active' : 'Inactive'}</p>
          <div className="flex gap-2 mt-3">
            <EditFairButton fair={fair} />
            <button
              onClick={() => toggleStatus(fair)}
              className="text-emerald-600 border border-emerald-600 px-3 py-1 rounded hover:bg-emerald-50 transition"
            >
              Toggle Status
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FairsList;
