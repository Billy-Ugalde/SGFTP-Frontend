import { useFairs, useUpdateFairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';

const FairsList = () => {
  const { data: fairs, isLoading } = useFairs();
  const updateStatus = useUpdateFairStatus();

  if (isLoading) return <p>Loading...</p>;

  const toggleStatus = async (fair: any) => {
    await updateStatus.mutateAsync({ id_fair: fair.id_fair, status: !fair.status });
  };

  return (
    <div>
      {fairs?.map(fair => (
        <div key={fair.id_fair} className="fair-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{fair.name}</h3>
            <span className={`status ${fair.status ? 'active' : 'inactive'}`}>
              {fair.status ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p>{fair.description}</p>
          <p><strong>Location:</strong> {fair.location}</p>
          <p><strong>Capacity:</strong> {fair.stand_capacity}</p>
          <div className="card-actions">
            <EditFairButton fair={fair} />
            <button onClick={() => toggleStatus(fair)} className="button button-outline">
              Toggle Status
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FairsList;
