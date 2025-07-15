import FairsList from "../Components/FairsList";
import AddFairButton from "../Components/AddFairButton";

const FairsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Fairs Management
              </h1>
              <p className="text-gray-600">
                Manage fairs for Tamarindo Park Foundation
              </p>
            </div>
            
            {/* TPF Branding */}
            <div className="text-right">
              <div className="text-2xl mb-1">🌿</div>
              <p className="text-sm font-medium" style={{ color: "#0A4558" }}>
                TPF Admin
              </p>
            </div>
          </div>
        </div>

        {/* Add Fair Button */}
        <AddFairButton />

        {/* Fairs List */}
        <FairsList />
      </div>
    </div>
  );
};

export default FairsPage;