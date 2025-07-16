import FairsList from "../Components/FairsList";
import AddFairButton from "../Components/AddFairButton";

const FairsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fairs Management</h1>
          <p className="text-gray-600">Manage fairs for Tamarindo Park Foundation</p>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-1">🌿</div>
          <p className="text-sm font-medium" style={{ color: "#0A4558" }}>TPF Admin</p>
        </div>
      </div>

      <AddFairButton />
      <FairsList />
    </div>
  );
};

export default FairsPage;
